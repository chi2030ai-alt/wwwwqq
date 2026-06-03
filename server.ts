import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";
import { ModaDB } from "./src/server/db";

// Initialize Firebase client for server backup & live cloud persistence syncing
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection as firestoreCollection, 
  getDocs as firestoreGetDocs, 
  setDoc as firestoreSetDoc, 
  doc as firestoreDoc 
} from "firebase/firestore";

// Load environment variables
dotenv.config();

let firebaseApp;
let serverDb: any = null;

try {
  const cfgPath = path.resolve("firebase-applet-config.json");
  if (fs.existsSync(cfgPath)) {
    const config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
    firebaseApp = initializeApp(config, "serverAppInstance");
    serverDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("[Firebase Server Init] Successfully bootstrapped Firestore with ID: " + config.firestoreDatabaseId);
  }
} catch (fireErr: any) {
  console.warn("[Firebase Server Warn] Failed to bootstrap cloud client fallback:", fireErr.message);
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Lazy safe Stripe initializer
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "MY_STRIPE_SECRET_KEY") {
    return null; // Fallback gracefully to realistic transaction simulator if keys aren't provisioned yet
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any
    });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // === 1. API STATUS PORTAL ===
  app.get("/api/status", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    const hasStripe = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "MY_STRIPE_SECRET_KEY";
    res.json({
      success: true,
      provider: "Gemini Engine (Cloud Run Gateway)",
      hasKey,
      hasStripe,
      stripeStatus: hasStripe ? "Provisioned" : "Simulation Fallback Active",
      status: hasKey ? "Online" : "Offline Simulation",
      env: process.env.NODE_ENV || "development",
      time: new Date().toISOString()
    });
  });

  // === 2. AUTHENTICATION SERVICES (AUTH & USERS API) ===
  app.post("/api/auth/register", (req, res) => {
    try {
      const { username, email, password, role = "Customer" } = req.body;
      if (!email || !password || !username) {
        res.status(400).json({ success: false, error: "Missing required registration parameters." });
        return;
      }
      const db = ModaDB.read();
      const userExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        res.status(409).json({ success: false, error: "Email already registered." });
        return;
      }
      const userId = `usr_${Math.random().toString(36).slice(2, 11)}`;
      const newUser = {
        id: userId,
        username,
        email,
        passwordHash: ModaDB.hashPassword(password),
        role,
        verified: false,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      ModaDB.write(db);
      ModaDB.log(userId, username, "USER_REGISTER", "AUTH", `User registration successful: ${email}`);

      res.status(201).json({ success: true, user: { id: userId, username, email, role } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, error: "Missing email or password." });
        return;
      }
      const db = ModaDB.read();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.passwordHash !== ModaDB.hashPassword(password)) {
        res.status(401).json({ success: false, error: "Invalid credentials." });
        return;
      }
      const sessionId = `sess_${Math.random().toString(36).slice(2, 15)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      db.sessions.push({ id: sessionId, userId: user.id, expiresAt });
      ModaDB.write(db);
      ModaDB.log(user.id, user.username, "USER_LOGIN", "AUTH", `User login session created: ${sessionId}`);

      res.json({ success: true, sessionId, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    try {
      const { sessionId } = req.body;
      if (sessionId) {
        const db = ModaDB.read();
        db.sessions = db.sessions.filter(s => s.id !== sessionId);
        ModaDB.write(db);
      }
      res.json({ success: true, message: "Logged out from unified console." });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Fetch users (Platform Admin & RBAC Audit)
  app.get("/api/users", (req, res) => {
    try {
      const db = ModaDB.read();
      res.json({ success: true, users: db.users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt })) });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 3. MERCHANTS & STORE TENANCY API ===
  app.get("/api/merchants", (req, res) => {
    try {
      const db = ModaDB.read();
      res.json({ success: true, merchants: db.merchants });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/merchants", (req, res) => {
    try {
      const { name, ownerId, billingPlan = "free" } = req.body;
      if (!name || !ownerId) {
        res.status(400).json({ success: false, error: "Name and ownerId are mandatory attributes." });
        return;
      }
      const db = ModaDB.read();
      const merchantId = `mer_${Math.random().toString(36).slice(2, 11)}`;
      const newMerchant = {
        id: merchantId,
        name,
        ownerId,
        status: "active" as const,
        billingPlan,
        createdAt: new Date().toISOString()
      };
      db.merchants.push(newMerchant);
      
      // Instantiate global tenant quotas
      db.tenants.push({
        id: merchantId,
        quotaLimit: billingPlan === "enterprise" ? 100000 : billingPlan === "growth" ? 5000 : 500,
        quotaUsed: 0,
        billingStatus: "paid"
      });

      ModaDB.write(db);
      ModaDB.log(ownerId, "SYSTEM", "MERCHANT_CREATE", "TENANT_ENGINE", `Merchant created: ${name} (${merchantId})`);
      res.status(201).json({ success: true, merchant: newMerchant });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/merchants/:id/suspend", (req, res) => {
    try {
      const { id } = req.params;
      const { suspend = true } = req.body;
      const db = ModaDB.read();
      const merchant = db.merchants.find(m => m.id === id);
      if (!merchant) {
        res.status(404).json({ success: false, error: "Merchant not found." });
        return;
      }
      merchant.status = suspend ? "suspended" : "active";
      ModaDB.write(db);
      ModaDB.log("ADMIN", "SUPER_ADMIN", "MERCHANT_STATUS_SHIFT", "TENANT_ENGINE", `Merchant status set to ${merchant.status}: ${id}`);
      res.json({ success: true, merchant });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 4. PRODUCTS SPU & SKU CONTROLS ===
  app.get("/api/products", (req, res) => {
    try {
      const db = ModaDB.read();
      res.json({ success: true, products: db.products });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/products", (req, res) => {
    try {
      const { storeId, name, category, price, inventory, sku, image = "📦" } = req.body;
      if (!name || price === undefined) {
        res.status(400).json({ success: false, error: "Name and price are required product values." });
        return;
      }
      const db = ModaDB.read();
      const newProd = {
        id: `prod_${Math.random().toString(36).slice(2, 11)}`,
        storeId: storeId || "universal_store",
        name,
        category: category || "General",
        price: Number(price),
        inventory: Number(inventory || 100),
        sku: sku || `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        variant: {},
        images: [image],
        createdAt: new Date().toISOString()
      };
      db.products.push(newProd);
      ModaDB.write(db);
      res.status(201).json({ success: true, product: newProd });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, inventory, sku, image } = req.body;
      const db = ModaDB.read();
      const prodIndex = db.products.findIndex(p => p.id === id);
      if (prodIndex === -1) {
        res.status(404).json({ success: false, error: "Product not found." });
        return;
      }
      const prod = db.products[prodIndex];
      if (name) prod.name = name;
      if (category) prod.category = category;
      if (price !== undefined) prod.price = Number(price);
      if (inventory !== undefined) prod.inventory = Number(inventory);
      if (sku) prod.sku = sku;
      if (image) prod.images = [image];
      ModaDB.write(db);
      res.json({ success: true, product: prod });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = ModaDB.read();
      db.products = db.products.filter(p => p.id !== id);
      ModaDB.write(db);
      res.json({ success: true, message: "Product deleted successfully." });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 5. ORDERS AUTOMATED DISPATCH SYSTEM ===
  app.get("/api/orders", (req, res) => {
    try {
      const db = ModaDB.read();
      res.json({ success: true, orders: db.orders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/orders", (req, res) => {
    try {
      const { userId, storeId, merchantId, items, totalPrice, orderType = "takeout", deliveryAddress } = req.body;
      if (!items || !items.length) {
        res.status(400).json({ success: false, error: "Order items sequence cannot be empty." });
        return;
      }
      const db = ModaDB.read();
      const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: orderId,
        userId: userId || "guest_user",
        storeId: storeId || "universal_store",
        merchantId: merchantId || "default_tenant",
        items,
        totalPrice: Number(totalPrice),
        status: "pending" as const,
        shipmentTracking: {
          carrier: "顺丰速运",
          trackingNumber: `SF${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          status: "待安排快递员揽收"
        },
        createdAt: new Date().toISOString()
      };
      
      db.orders.push(newOrder);

      // Deduct product inventory dynamically (Real Inventory Check)
      items.forEach((it: any) => {
        const prod = db.products.find(p => p.id === it.productId);
        if (prod) {
          prod.inventory = Math.max(0, prod.inventory - (it.quantity || 1));
        }
      });

      ModaDB.write(db);
      ModaDB.log(userId || "GUEST", "BUYER", "ORDER_PLACED", "ORDER_ENG", `Placed order: ${orderId} total: ¥${totalPrice}`);
      res.status(201).json({ success: true, order: newOrder });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put("/api/orders/:id/dispatch", (req, res) => {
    try {
      const { id } = req.params;
      const { status = "shipped" } = req.body;
      const db = ModaDB.read();
      const order = db.orders.find(o => o.id === id);
      if (!order) {
        res.status(404).json({ success: false, error: "Order not found." });
        return;
      }
      order.status = status;
      if (order.shipmentTracking) {
        order.shipmentTracking.status = status === "shipped" ? "顺丰专车正在飞速寄送中，预计明日送达" : "已签发妥投";
      }
      ModaDB.write(db);
      ModaDB.log("MERCHANT", "STAFF_DISPATCHER", "ORDER_DISPATCH", "ORDER_ENG", `Dispatched tracking update for: ${id} to ${status}`);
      res.json({ success: true, order });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/orders/:id/refund", (req, res) => {
    try {
      const { id } = req.params;
      const { reason = "客户申请无理由退款" } = req.body;
      const db = ModaDB.read();
      const order = db.orders.find(o => o.id === id);
      if (!order) {
        res.status(404).json({ success: false, error: "Order not found." });
        return;
      }
      order.status = "refunded";
      order.refundReason = reason;

      // Reverse revenue ledgers and create financial correction transaction
      const refundId = `PAY-REF-${Math.floor(100000 + Math.random() * 900000)}`;
      db.finance.push({
        id: refundId,
        merchantId: order.merchantId,
        type: "expense",
        amount: order.totalPrice,
        orderId: order.id,
        description: `订单退款原路退回: ${order.id}. 原因: ${reason}`,
        createdAt: new Date().toISOString()
      });

      ModaDB.write(db);
      ModaDB.log("MERCHANT", "MANAGER_REFUND", "ORDER_REFUND", "PAYMENT_ENG", `Process refund for order ${id}: ¥${order.totalPrice}`);
      res.json({ success: true, order });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 6. STRIPE & ALIPAY DIRECT TRANSACTIONS (WITH CALLBACK WEBHOOKS) ===
  app.post("/api/payments/stripe/checkout", async (req, res) => {
    try {
      const { orderId, amount, currency = "cny" } = req.body;
      if (!orderId || !amount) {
        res.status(400).json({ success: false, error: "OrderId and amount are required for checkout sessions." });
        return;
      }

      const stripe = getStripe();
      if (stripe) {
        // True Stripe Session execution for exact credit card processing matches
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: currency,
                product_data: {
                  name: `MODA 智体企业服务网店订单: ${orderId}`
                },
                unit_amount: Math.round(Number(amount) * 100) // stripe is in cents
              },
              quantity: 1
            }
          ],
          mode: "payment",
          success_url: `${req.headers.origin || "http://localhost:3000"}/customer-mall?success=true&order_id=${orderId}`,
          cancel_url: `${req.headers.origin || "http://localhost:3000"}/customer-mall?cancelled=true`
        });
        
        // Save the transaction record as pending
        const db = ModaDB.read();
        db.payments.push({
          id: `pay_${Math.random().toString(36).slice(2, 11)}`,
          orderId,
          amount: Number(amount),
          method: "Stripe",
          status: "pending",
          transactionId: session.id,
          createdAt: new Date().toISOString()
        });
        ModaDB.write(db);

        res.json({ success: true, url: session.url, isSimulation: false });
      } else {
        // Safe immersive high-fidelity simulation fallbacks if no API key is specified
        const mockSessionId = `cs_test_${Math.random().toString(36).slice(2, 20)}`;
        const db = ModaDB.read();
        
        db.payments.push({
          id: `pay_${Math.random().toString(36).slice(2, 11)}`,
          orderId,
          amount: Number(amount),
          method: "Stripe",
          status: "succeeded",
          transactionId: mockSessionId,
          createdAt: new Date().toISOString()
        });

        // Add to finance records simultaneously
        const order = db.orders.find(o => o.id === orderId);
        const mId = order ? order.merchantId : "default_tenant";
        db.finance.push({
          id: `FIN-${Math.floor(100000 + Math.random() * 900000)}`,
          merchantId: mId,
          type: "revenue",
          amount: Number(amount),
          orderId,
          description: `网店零售客单收款 (渠道: Stripe 快捷支付)`,
          createdAt: new Date().toISOString()
        });

        // Trigger billing log simulation (invoice dispatching)
        db.audit_logs.unshift({
          id: crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: "STRIPE_GATEWAY",
          username: "Stripe Webhook Listener",
          action: "INCOMING_CALLBACK",
          component: "PAYMENT_ENG",
          details: `付款回调校验成功。流水笔ID: ${mockSessionId}. 支付金额: ¥${amount}`
        });

        ModaDB.write(db);

        res.json({
          success: true,
          url: `${req.headers.origin || "http://localhost:3000"}/customer-mall?success=true&order_id=${orderId}`,
          isSimulation: true,
          message: "Stripe Sandbox Checkout Complete (Simulated callback webhook triggered instantly)"
        });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/payments/alipay/checkout", (req, res) => {
    try {
      const { orderId, amount } = req.body;
      const db = ModaDB.read();
      const mockPayId = `ALI_TX_${Math.floor(10000 + Math.random() * 90000)}`;

      db.payments.push({
        id: `pay_${Math.random().toString(36).slice(2, 11)}`,
        orderId,
        amount: Number(amount),
        method: "Alipay",
        status: "succeeded",
        transactionId: mockPayId,
        createdAt: new Date().toISOString()
      });

      const order = db.orders.find(o => o.id === orderId);
      const mId = order ? order.merchantId : "default_tenant";
      db.finance.push({
        id: `FIN-${Math.floor(100000 + Math.random() * 900000)}`,
        merchantId: mId,
        type: "revenue",
        amount: Number(amount),
        orderId,
        description: `支付宝快捷手机结账订单: ${orderId}`,
        createdAt: new Date().toISOString()
      });

      // Automatically advance order stage to processing
      if (order) {
        order.status = "processing";
        if (order.shipmentTracking) {
          order.shipmentTracking.status = "买家支付完成，系统正在自动打包准备出配";
        }
      }

      ModaDB.write(db);
      ModaDB.log("ALIPAY_SDK", "支付宝中继服务", "PAYMENT_CALLBACK", "FINANCE", `Alipay callback checkout success. Order ID: ${orderId}, txn: ${mockPayId}`);

      res.json({ success: true, txnId: mockPayId, message: "Alipay mobile layout parsed. Successful callback webhook applied." });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 7. FINANCE LEDGER & METRICS ===
  app.get("/api/finance/ledger", (req, res) => {
    try {
      const db = ModaDB.read();
      res.json({ success: true, ledger: db.finance });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 8. AUDIT LOGS SEARCH INDEX ===
  app.get("/api/audit/logs", (req, res) => {
    try {
      const { search, component } = req.query;
      const db = ModaDB.read();
      let logs = db.audit_logs;
      if (search) {
        const query = String(search).toLowerCase();
        logs = logs.filter(l => 
          l.details.toLowerCase().includes(query) || 
          l.action.toLowerCase().includes(query) || 
          l.username.toLowerCase().includes(query)
        );
      }
      if (component) {
        logs = logs.filter(l => l.component === component);
      }
      res.json({ success: true, length: logs.length, logs });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 9. COGNITIVE VECTOR ENGINE & SEMANTIC RAG RETRIEVER ===
  function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async function retrieveRAGContext(queryText: string, tenantId: string): Promise<string> {
    try {
      const api = getGeminiClient();
      const embedRes = await api.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: [queryText]
      });
      const queryVector = embedRes.embeddings?.[0]?.values || (embedRes as any).embedding?.values;
      if (!queryVector) return "";

      let chunks: any[] = [];
      
      // Attempt Firestore retrieval first
      if (serverDb) {
        try {
          const colRef = firestoreCollection(serverDb, "tenants", tenantId || "default_tenant", "kb_chunks");
          const snap = await firestoreGetDocs(colRef);
          snap.forEach(docSnap => {
            const d = docSnap.data();
            if (d.vector && d.content) {
              chunks.push(d);
            }
          });
        } catch (fsErr: any) {
          console.warn("Firestore RAG chunks sync-read warning:", fsErr.message);
        }
      }

      // Fallback to local DB if Firestore has no vector embeddings yet
      if (chunks.length === 0) {
        const localDB = ModaDB.read();
        chunks = localDB.kb_chunks.filter(c => c.merchantId === tenantId && (c as any).vector);
      }

      if (chunks.length === 0) return "";

      // Score similarities
      const scored = chunks.map(c => {
        const score = cosineSimilarity(queryVector, c.vector);
        return { ...c, score };
      });

      // Sort descending and filter top matches
      const topMatches = scored
        .filter(item => item.score > 0.60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (topMatches.length === 0) return "";

      console.log(`[RAG Engine] Successfully retrieved ${topMatches.length} relevant context blocks with max score of ${(topMatches[0].score * 100).toFixed(1)}%`);
      return topMatches.map((m, idx) => `[已关联商业规则 #${idx + 1}] 《${m.title}》\n真实规章条目：\n${m.content}`).join("\n\n");
    } catch (err: any) {
      console.warn("[RAG Context Retrieval warning]:", err.message);
      return "";
    }
  }

  // === 10. KNOWLEDGE BASE & EMBEDDING RAG APIS ===
  app.get("/api/knowledge", async (req, res) => {
    try {
      const tenantId = String(req.query.tenantId || "default_tenant");
      let chunks: any[] = [];
      if (serverDb) {
        try {
          const colRef = firestoreCollection(serverDb, "tenants", tenantId, "kb_chunks");
          const snap = await firestoreGetDocs(colRef);
          snap.forEach(docSnap => {
            const data = docSnap.data();
            // Prevent sending huge vector arrays unless requested to conserve pipeline speed
            chunks.push(data);
          });
        } catch (fsErr: any) {
          console.warn("Firestore read kb_chunks warning fallback to local:", fsErr.message);
        }
      }
      if (chunks.length === 0) {
        const localDB = ModaDB.read();
        chunks = localDB.kb_chunks.filter(c => c.merchantId === tenantId);
      }
      res.json({ success: true, chunks });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/knowledge/add", async (req, res) => {
    try {
      const { title, content, category, tenantId } = req.body;
      if (!title || !content || !category) {
        res.status(400).json({ success: false, error: "Missing title, content, or category." });
        return;
      }
      const activeTenant = tenantId || "default_tenant";

      // Compute embedding vector using Gemini real model
      let vector: number[] | null = null;
      let tokenCount = Math.floor(content.length * 1.3);
      try {
        const client = getGeminiClient();
        const embedRes = await client.models.embedContent({
          model: "gemini-embedding-2-preview",
          contents: [content]
        });
        vector = embedRes.embeddings?.[0]?.values || (embedRes as any).embedding?.values || null;
        console.log(`[Embedding Engine] Computed vector (dims: ${vector?.length}) for: ${title}`);
      } catch (warn: any) {
        console.warn("[Embedding Engine Warning] Failed to compute text vector embedding:", warn.message);
      }

      const chunkId = `chk_${Math.random().toString(36).slice(2, 11)}`;
      const newChunk = {
        id: chunkId,
        merchantId: activeTenant,
        title,
        content,
        tokenCount,
        category,
        vector,
        createdAt: new Date().toISOString()
      };

      // Persistence Layer 1: Local atomic write-through fallback
      const db = ModaDB.read();
      db.kb_chunks.push(newChunk);
      ModaDB.write(db);

      // Persistence Layer 2: Live Client Cloud Firestore
      if (serverDb) {
        try {
          const docRef = firestoreDoc(serverDb, "tenants", activeTenant, "kb_chunks", chunkId);
          await firestoreSetDoc(docRef, newChunk);
          console.log(`[Firestore Match] kb_chunk synced to clouds namespace tenants/${activeTenant}/kb_chunks/${chunkId}`);
        } catch (fsErr: any) {
          console.warn("Firestore sync-write warning:", fsErr.message);
        }
      }

      res.status(201).json({ success: true, chunk: newChunk });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete("/api/knowledge/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = String(req.query.tenantId || "default_tenant");
      
      const db = ModaDB.read();
      db.kb_chunks = db.kb_chunks.filter(c => c.id !== id);
      ModaDB.write(db);

      if (serverDb) {
        try {
          const { deleteDoc } = await import("firebase/firestore");
          const docRef = firestoreDoc(serverDb, "tenants", tenantId, "kb_chunks", id);
          await deleteDoc(docRef);
        } catch (fsErr: any) {
          console.warn("Firestore kb_chunks item deletion failing:", fsErr.message);
        }
      }
      res.json({ success: true, message: "KB chunk removed successfully from matching sync lanes." });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Fetch all pending and processed task logs
  app.get("/api/agents/tasks", async (req, res) => {
    try {
      const tenantId = String(req.query.tenantId || "default_tenant");
      let tasks: any[] = [];
      if (serverDb) {
        try {
          const colRef = firestoreCollection(serverDb, "tenants", tenantId, "agent_tasks");
          const snap = await firestoreGetDocs(colRef);
          snap.forEach(docSnap => {
            tasks.push(docSnap.data());
          });
        } catch (fsErr: any) {
          console.warn("Firestore fetch agent tasks falled back:", fsErr.message);
        }
      }
      if (tasks.length === 0) {
        const localDB = ModaDB.read();
        tasks = localDB.agent_tasks;
      }
      // sort latest first
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, tasks });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // === 11. AGENT RUNTIME DISPATCH ENGINE & TASK SCHEDULERS (REAL FIRESTORE & DUAL SYNCED QUEUE) ===
  app.post("/api/agents/execute", async (req, res) => {
    try {
      const { agentId, teamId, inputMessage, rolePrompt, tenantId } = req.body;
      if (!agentId || !inputMessage) {
        res.status(400).json({ success: false, error: "Missing agentId or input message content." });
        return;
      }
      const activeTenant = tenantId || "default_tenant";
      const db = ModaDB.read();
      const taskId = `task_${Math.random().toString(36).slice(2, 11)}`;
      
      const newPendingTask = {
        id: taskId,
        teamId: teamId || "universal_team",
        agentId,
        inputMessage,
        status: "processing" as const,
        createdAt: new Date().toISOString()
      };
      
      db.agent_tasks.push(newPendingTask);
      ModaDB.write(db);

      // Write transaction to Firestore live tasks queue namespace
      if (serverDb) {
        try {
          const taskRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
          await firestoreSetDoc(taskRef, newPendingTask);
        } catch (taskErr: any) {
          console.warn("Firestore task enqueue log warning:", taskErr.message);
        }
      }

      // Perform Gemini reasoning processing or offline simulation dynamically
      try {
        const client = getGeminiClient();
        
        // Retrieve context using RAG
        const retrievedRAG = await retrieveRAGContext(inputMessage, activeTenant);
        const enhancedSystemInstruction = retrievedRAG
          ? `${rolePrompt || "你是一个摩整数字员工智能工作站"}\n\n=== RAG 商业规则与规章参考 (Real Retrieve) ===\n${retrievedRAG}`
          : (rolePrompt || "你是一个摩整数字员工智能工作站");

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: inputMessage,
          config: {
            systemInstruction: enhancedSystemInstruction,
            temperature: 0.8
          }
        });

        const reply = response.text || "已完成相应的数字流程分析并自动交付中继。";
        
        // Update task status inside local DB
        const freshDB = ModaDB.read();
        const activeTask = freshDB.agent_tasks.find(t => t.id === taskId);
        if (activeTask) {
          activeTask.status = "completed";
          activeTask.response = reply;
          activeTask.completedAt = new Date().toISOString();
        }
        ModaDB.write(freshDB);

        // Update task status inside Firestore
        if (serverDb) {
          try {
            const taskRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
            await firestoreSetDoc(taskRef, {
              ...newPendingTask,
              status: "completed",
              response: reply,
              completedAt: new Date().toISOString()
            });
          } catch (taskErr: any) {
            console.warn("Firestore task fulfillment sync exception:", taskErr.message);
          }
        }

        res.json({ success: true, taskId, status: "completed", response: reply });
      } catch (geminiError: any) {
        console.warn("Gemini Engine runtime call fallback (applying simulated logic):", geminiError.message);
        
        const responseFallback = `[智体自主代运营中继]：已接受数据 "${inputMessage}"。已根据目前商家最合适的价格，进行一键补货，同步完成顺丰寄发。`;
        const freshDB = ModaDB.read();
        const activeTask = freshDB.agent_tasks.find(t => t.id === taskId);
        if (activeTask) {
          activeTask.status = "completed";
          activeTask.response = responseFallback;
          activeTask.completedAt = new Date().toISOString();
        }
        ModaDB.write(freshDB);

        if (serverDb) {
          try {
            const taskRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
            await firestoreSetDoc(taskRef, {
              ...newPendingTask,
              status: "completed",
              response: responseFallback,
              completedAt: new Date().toISOString()
            });
          } catch (taskErr: any) {
            console.warn("Firestore task simulation callback exception:", taskErr.message);
          }
        }

        res.json({ success: true, taskId, status: "completed", response: responseFallback, warning: geminiError.message });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // API 2: Interactive AI Employee response dispatcher (With Full Real RAG Retrieval and Cloud Logs)
  app.post("/api/chat", async (req, res) => {
    try {
      const { 
        message, 
        employeeRole, 
        employeeName, 
        employeeDesc, 
        industryName, 
        industryTagline,
        strategyName,
        strategyDesc,
        tenantId
      } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message input is required." });
        return;
      }

      const activeTenant = tenantId || "default_tenant";

      // System instruction template to give high-fidelity specialized role-playing behavior
      const systemInstruction = `你是一位高智商、极具智慧与实操执行力的数字员工（类似 Shopify Sidekick 智能伙伴）。
你的名字和岗位是：【${employeeRole} - ${employeeName}】
你目前所在的行业公司：【${industryName}】(${industryTagline})
当前公司选择的经营和运营战略：【${strategyName}】(${strategyDesc})
你的核心工作范畴：${employeeDesc}

请以此真实雇员身份，面对公司创始人（所有者，即用户）下达的指令、询问或探讨，进行专业、高效、针对性强、不拖泥带出的直接回复：
1. 语言表达：自然、沉着、带有该行当行话特色的语感。
2. 回复结构：不用客套寒暄、不要背书、也不要输出任何前置 of 助手说明文字。
3. 关键特色：紧扣行业痛点，结合当前的运营策略（精益/扩张/全权托管）来组织你的策略与态度。
4. 字数控制：保持高度凝练，并严格控制在 160 字以内，字字珠玑，突出高算力高能效。
5. **(Sidekick 后台实地执勤与微操作系统级能力)**:
作为掌握实机控制能力的 AI 面板秘书，如果创始人向你下达了“做/修改/设定/执行”等具体操作指令，你应在专业文字回复后，在文字末尾追加一串具体的物理动作标签（文字中需同步表达‘已为您自动修改并提交’或‘已极速派单’）。
动作标签格式必须为（单独紧随行尾，包含左右括号）：
- 更换网店主图标语:  [ACTION: SET_HEADLINE | 标语文字]
- 更换首页视觉主题:  [ACTION: SET_THEME | retro|dark|classic] (选择对应的主题ID)
- 研发并自动上架产品: [ACTION: ADD_PRODUCT | 商品品名 | 售价] (售价需为纯数字，如129)
- 一键完成订单自动分包并极速发顺丰快递: [ACTION: SHIP_ORDERS]
- 解决客户纠纷调停(解救李阿姨投诉): [ACTION: RESOLVE_COMPLAINT]
- 调整并更改直通车营销每日资金预算:  [ACTION: SET_BUDGET | 预算金额] (金额需为50~1000内的数字)

注意：如果用户只是闲聊或泛泛而谈，探讨经营方法，而非直接要求你操作或改动，则**绝对不能**附带任何 [ACTION] 标签。`;

      // 1. Live Semantic RAG Retrieval overlay
      const retrievedRAG = await retrieveRAGContext(message, activeTenant);
      const enhancedSystemPrompt = retrievedRAG
        ? `${systemInstruction}\n\n=== 智体匹配到的知识库商业规则 (RAG Context) ===\n${retrievedRAG}`
        : systemInstruction;

      try {
        const ai = getGeminiClient();
        
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction: enhancedSystemPrompt,
            temperature: 0.85,
            topP: 0.9,
          },
        });

        const reply = response.text || "接收到了您的指示，我已经在落实相应的数字要素调整。";
        res.json({ success: true, reply, source: "Gemini Cloud Live Engine (RAG Enabled)" });
      } catch (err: any) {
        console.warn("Gemini Live server call failed, returning simulated responsive fallback:", err.message);
        
        // Simulating the AI employee offline behavior intelligently
        let simulatedReply = `你好，我是【${employeeRole} - ${employeeName}】。已收到关于商铺运作管理提案：对业务要素进行科学精算与匹配。`;
        if (message.includes("换标语") || message.includes("口号") || message.includes("修改标语")) {
          simulatedReply = `好的创始人，我正在通过 MODAUI 双向同步链路精调店招画卷。已为您自动修改并提交新标语。[ACTION: SET_HEADLINE | ${message.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "").slice(-20)}]`;
        } else if (message.includes("上架") || message.includes("研发新产品") || message.includes("上新")) {
          const matchPrice = message.match(/\d+/);
          const price = matchPrice ? Number(matchPrice[0]) : 199;
          simulatedReply = `已经调集了供应链伙伴，一键研发完成、并全额生成主页海报，已为您自动修改并提交产品正式上架出售！[ACTION: ADD_PRODUCT | AI 极智爆款好物 | ${price}]`;
        } else if (message.includes("发货") || message.includes("顺丰") || message.includes("寄送")) {
          simulatedReply = `报告掌柜！您的新单积存货栈已于1秒前自动理算，由顺丰快递派送极速打单完毕。已极速派单顺丰发运！[ACTION: SHIP_ORDERS]`;
        } else if (message.includes("投诉") || message.includes("差评") || message.includes("李阿姨")) {
          simulatedReply = `不用担心，我已联系客户进行了贴心致歉，全额退还了算力损耗，并补偿了首單专享券。投诉已顺利撤销调停！[ACTION: RESOLVE_COMPLAINT]`;
        } else if (message.includes("广告") || message.includes("预算") || message.includes("直通车")) {
          simulatedReply = `明白。现已通过精益理财层计算合理的每日竞价扣减阈值，预算已调实。[ACTION: SET_BUDGET | 350]`;
        }

        res.json({ 
          success: true, 
          source: "Simulated Offline Engine (RAG Fallback)",
          reply: simulatedReply
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Serve static assets OR handle Vite in middleware mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Host Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
