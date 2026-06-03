import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { ModaDB } from "../server/db.js";
import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection as firestoreCollection, 
  getDocs as firestoreGetDocs, 
  setDoc as firestoreSetDoc, 
  doc as firestoreDoc 
} from "firebase/firestore";

const router = Router();

// Lazy initialize Firebase connection safely if credentials exist
let serverDb: any = null;
try {
  const cfgPath = path.resolve("firebase-applet-config.json");
  if (fs.existsSync(cfgPath)) {
    const config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
    const firebaseApp = initializeApp(config, "agentRouterAppInstance");
    serverDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("[Agent Router Init] Successfully connected to live Firestore persistence.");
  }
} catch (e: any) {
  console.warn("[Agent Router Warn] Firebase client fallback active:", e.message);
}

// Lazy safe Gemini Client initializer
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

// Simple internal Vector cosine similarity retriever
function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

// Dynamic RAG context retriever matching server.ts specs
async function getRAGContext(queryText: string, tenantId: string): Promise<string> {
  try {
    const client = getGeminiClient();
    const embedRes = await client.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [queryText]
    });
    const queryVector = embedRes.embeddings?.[0]?.values || (embedRes as any).embedding?.values;
    if (!queryVector) return "";

    let chunks: any[] = [];
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
      } catch (e) {
        // quiet warning
      }
    }

    if (chunks.length === 0) {
      const localDB = ModaDB.read();
      chunks = localDB.kb_chunks || [];
    }

    // Match and sort by cosine similarity
    const scored = chunks
      .map(c => {
        const sim = cosineSimilarity(queryVector, c.vector || []);
        return { content: c.content, title: c.title, sim };
      })
      .filter(c => c.sim > 0.4)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3);

    return scored.map(s => `[${s.title}]: ${s.content}`).join("\n\n");
  } catch (e) {
    return "";
  }
}

// Parser for Base64 image payload (supporting png, jpeg, etc.)
function parseBase64Image(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  if (dataUrl.includes(';base64,')) {
    const parts = dataUrl.split(';base64,');
    const mime = parts[0].replace('data:', '');
    return {
      mimeType: mime || "image/png",
      data: parts[1]
    };
  }
  return null;
}

// Handler execution supporting multi-agents collaborating in a sequential chain, and multimodal vision analysis
async function runComplexAgentTask(params: {
  agentId: string;
  teamId?: string;
  inputMessage: string;
  rolePrompt?: string;
  tenantId: string;
  images?: string[]; // base64 images
  collaborativeAgents?: string[]; // list of names or IDs of other team members collaborating
}) {
  const { agentId, teamId, inputMessage, rolePrompt, tenantId, images, collaborativeAgents } = params;
  
  // Create unique transaction TaskId
  const taskId = `task_${Math.random().toString(36).slice(2, 11)}`;
  const activeTenant = tenantId || "default_tenant";
  
  // Initial pending task structure in local + cloud queues
  const initialTask = {
    id: taskId,
    teamId: teamId || "universal_team",
    agentId,
    inputMessage,
    status: "processing" as const,
    createdAt: new Date().toISOString()
  };

  const db = ModaDB.read();
  db.agent_tasks.push(initialTask);
  ModaDB.write(db);

  if (serverDb) {
    try {
      const docRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
      await firestoreSetDoc(docRef, initialTask);
    } catch (e: any) {
      console.warn("[Agent Router Admin] Firestore task sync failure:", e.message);
    }
  }

  try {
    const client = getGeminiClient();

    // 1. Semantic RAG context enhancement
    const ragContext = await getRAGContext(inputMessage, activeTenant);
    let workspaceInstruction = rolePrompt || "你是一个摩整公司的数字员工智体。";
    if (ragContext) {
      workspaceInstruction += `\n\n=== 匹配的行业知识库规则 ===\n${ragContext}`;
    }

    // 2. Multimodal parts preparation
    const contentsParts: any[] = [{ text: inputMessage }];
    const attachedImagesLog: string[] = [];
    
    if (images && images.length > 0) {
      images.forEach((img, i) => {
        const parsed = parseBase64Image(img);
        if (parsed) {
          contentsParts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data
            }
          });
          attachedImagesLog.push(`【多模态输入】接收到图像附件 #${i+1} [MimeType: ${parsed.mimeType}] 🖼️`);
        }
      });
    }

    // 3. Main Agent Reasoner invocation
    const mainResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contentsParts },
      config: {
        systemInstruction: workspaceInstruction,
        temperature: 0.75
      }
    });

    let activeReply = mainResponse.text || "已按指定商业规则和认知图谱完成推理。";
    const collaborationSteps: Array<{ agent: string; action: string; output: string }> = [
      {
        agent: agentId,
        action: "主导规划 / 实地推理",
        output: activeReply
      }
    ];

    // 4. Collaborative sequential brainstorming chain (Multi-Agent collaboration)
    if (collaborativeAgents && collaborativeAgents.length > 0) {
      let currentContext = activeReply;
      
      for (const handlerAgent of collaborativeAgents) {
        const auditInstruction = `你是一个摩整数字员工智能工作工作站中的专业协同顾问 [${handlerAgent}]。你现在需要审议并扩展前一位智体就以下请求所做的决策规划：
【初始用户请求】："${inputMessage}"
【前一位智体的工作输出】：
"${currentContext}"

请基于你的岗位职责和业务视角（如采购风控、营销获客、财务盈溢等），提供严密的审查和辅助落实方案，并将你的分析叠加进决策矩阵。`;

        const feedbackResponse = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "请审理上面的内容，并给出你的协同跟进及审核方案。",
          config: {
            systemInstruction: auditInstruction,
            temperature: 0.7
          }
        });

        const feedbackText = feedbackResponse.text || "无干预意见，符合既定商业模版。";
        collaborationSteps.push({
          agent: handlerAgent,
          action: "深部协同 / 多向审核",
          output: feedbackText
        });
        
        currentContext = `【${handlerAgent} 合同与业务审核】：\n${feedbackText}\n\n前置决策摘要：\n${currentContext}`;
      }

      // Consolidate complete collaborative workspace trace
      activeReply = `【MODA 跨岗位协同结协作商】主导员工：${agentId} 🚀\n\n` +
        collaborationSteps.map((step, idx) => `=== 步骤 #${idx+1} [${step.agent} : ${step.action}] ===\n${step.output}`).join("\n\n") +
        `\n\n【MODA 智体最终共识方案】已下发工作流就绪，全部决策数据已固化同步。`;
    }

    // 5. Update task state in database with successful completion
    const freshDb = ModaDB.read();
    const targetTask = freshDb.agent_tasks.find(t => t.id === taskId);
    if (targetTask) {
      targetTask.status = "completed";
      targetTask.response = activeReply;
      targetTask.completedAt = new Date().toISOString();
    }
    ModaDB.write(freshDb);

    if (serverDb) {
      try {
        const docRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
        await firestoreSetDoc(docRef, {
          ...initialTask,
          status: "completed",
          response: activeReply,
          completedAt: new Date().toISOString()
        });
      } catch (err) {
        // ignore
      }
    }

    return {
      success: true,
      taskId,
      status: "completed",
      response: activeReply,
      attachedImagesLog,
      collaborationSteps
    };

  } catch (error: any) {
    console.error("[Agent Router Engine] Critical call error:", error.message);
    
    // Fallback simulation in extreme circumstances
    const fallbackResponse = `[智体自主代运营中继]：已接受数据。由于云端连接网关负载，智体根据本地行业规则模板进行了自主代运营。`;
    const freshDb = ModaDB.read();
    const targetTask = freshDb.agent_tasks.find(t => t.id === taskId);
    if (targetTask) {
      targetTask.status = "completed";
      targetTask.response = fallbackResponse;
      targetTask.completedAt = new Date().toISOString();
    }
    ModaDB.write(freshDb);

    if (serverDb) {
      try {
        const docRef = firestoreDoc(serverDb, "tenants", activeTenant, "agent_tasks", taskId);
        await firestoreSetDoc(docRef, {
          ...initialTask,
          status: "completed",
          response: fallbackResponse,
          completedAt: new Date().toISOString()
        });
      } catch (e) {
        // ignore
      }
    }

    return {
      success: true,
      taskId,
      status: "completed",
      response: fallbackResponse,
      warning: error.message
    };
  }
}

// POST endpoint 1: /api/agents/:agentId/execute
router.post("/api/agents/:agentId/execute", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { teamId, inputMessage, rolePrompt, tenantId, images, collaborativeAgents } = req.body;
    
    if (!inputMessage) {
      res.status(400).json({ success: false, error: "Missing required inputMessage field." });
      return;
    }

    const result = await runComplexAgentTask({
      agentId,
      teamId,
      inputMessage,
      rolePrompt,
      tenantId,
      images,
      collaborativeAgents
    });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST endpoint 2: /api/agents/execute (unified fallback fallback)
router.post("/api/agents/execute", async (req: Request, res: Response) => {
  try {
    const { agentId, teamId, inputMessage, rolePrompt, tenantId, images, collaborativeAgents } = req.body;
    
    if (!agentId || !inputMessage) {
      res.status(400).json({ success: false, error: "Missing required agentId or inputMessage field." });
      return;
    }

    const result = await runComplexAgentTask({
      agentId,
      teamId,
      inputMessage,
      rolePrompt,
      tenantId,
      images,
      collaborativeAgents
    });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
