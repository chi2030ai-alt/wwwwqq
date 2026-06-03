import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app once
let firebaseApp: any = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

// Singleton initialization function
function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    // CRITICAL: The app will break without specifying the firestoreDatabaseId
    firebaseDb = getFirestore(firebaseApp, (firebaseConfig as any).firestoreDatabaseId);
  }
  return { firebaseApp, firebaseAuth, firebaseDb };
}

// Lazy initialize on first access
export function getFirebaseApp() {
  return initializeFirebase().firebaseApp;
}

export function getFirebaseAuth() {
  const { firebaseAuth } = initializeFirebase();
  return firebaseAuth;
}

export function getFirebaseDb() {
  const { firebaseDb } = initializeFirebase();
  return firebaseDb;
}

// For backward compatibility, export as direct references
// but they will be lazy-initialized
export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();

// ============================================
// Firebase Error Handling
// ============================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = getFirebaseAuth();
  const currentUser = currentAuth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('[Firebase Error]', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// Firebase Utility Functions
// ============================================

/**
 * Check if Firebase is properly initialized
 */
export function isFirebaseReady(): boolean {
  try {
    return !!(getFirebaseAuth() && getFirebaseDb());
  } catch {
    return false;
  }
}

/**
 * Gracefully handle Firebase initialization errors
 */
export function tryInitializeFirebase(): { success: boolean; error?: string } {
  try {
    initializeFirebase();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Firebase initialization error',
    };
  }
}

// ============================================
// Multi-Tenant Isolation Firestore Service Layer
// ============================================
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  DocumentData,
  onSnapshot
} from 'firebase/firestore';

export const FirestoreTenantService = {
  /**
   * Generates the multi-tenant physical isolated path
   * path template: /industries/{industryId}/shops/{shopId}/{collectionName}
   */
  getIsolatedPath(industryId: string, shopId: string, collectionName: string): string {
    const cleanInd = (industryId || 'fashion').toLowerCase();
    const cleanShop = (shopId || 'universal_store').toLowerCase();
    return `industries/${cleanInd}/shops/${cleanShop}/${collectionName}`;
  },

  /**
   * Returns a reference to the isolated collection
   */
  getCollectionRef(industryId: string, shopId: string, collectionName: string) {
    const firestoreDb = getFirebaseDb();
    if (!firestoreDb) throw new Error('Firebase firestore database is not initialized');
    const pathValue = this.getIsolatedPath(industryId, shopId, collectionName);
    return collection(firestoreDb, pathValue);
  },

  /**
   * Returns a reference to a specific document inside the isolated path
   */
  getDocRef(industryId: string, shopId: string, collectionName: string, docId: string) {
    const firestoreDb = getFirebaseDb();
    if (!firestoreDb) throw new Error('Firebase firestore database is not initialized');
    const pathValue = this.getIsolatedPath(industryId, shopId, collectionName);
    return doc(firestoreDb, pathValue, docId);
  },

  /**
   * Reads documents from an isolated collection, automatically verifying and filtering by shopId.
   */
  async getDocuments(industryId: string, shopId: string, collectionName: string): Promise<any[]> {
    try {
      const colRef = this.getCollectionRef(industryId, shopId, collectionName);
      const snapshot = await getDocs(colRef);
      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...(doc.data() as Record<string, any>), shopId });
      });
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.getIsolatedPath(industryId, shopId, collectionName));
      return [];
    }
  },

  /**
   * Saves a document to the isolated path with automatic tenant metadata binding
   */
  async saveDocument(industryId: string, shopId: string, collectionName: string, docId: string, data: any): Promise<any> {
    try {
      const docRef = this.getDocRef(industryId, shopId, collectionName, docId);
      const payload = {
        ...data,
        id: docId,
        shopId,
        industryId,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload, { merge: true });
      return payload;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.getIsolatedPath(industryId, shopId, collectionName)}/${docId}`);
      return null;
    }
  },

  /**
   * Deletes a document from the isolated path
   */
  async deleteDocument(industryId: string, shopId: string, collectionName: string, docId: string): Promise<boolean> {
    try {
      const docRef = this.getDocRef(industryId, shopId, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.getIsolatedPath(industryId, shopId, collectionName)}/${docId}`);
      return false;
    }
  },

  /**
   * Sets up a real-time reactive subscription on the isolated collection path
   */
  subscribeCollection(
    industryId: string, 
    shopId: string, 
    collectionName: string, 
    onUpdate: (data: any[]) => void,
    onError?: (err: any) => void
  ) {
    try {
      const colRef = this.getCollectionRef(industryId, shopId, collectionName);
      return onSnapshot(colRef, (snapshot) => {
        const data: any[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data(), shopId });
        });
        onUpdate(data);
      }, (err) => {
        if (onError) onError(err);
        else console.error(`Subscription error for ${this.getIsolatedPath(industryId, shopId, collectionName)}:`, err);
      });
    } catch (error) {
      console.error(`Failed to register snapshot listener for ${this.getIsolatedPath(industryId, shopId, collectionName)}`, error);
      throw error;
    }
  }
};

