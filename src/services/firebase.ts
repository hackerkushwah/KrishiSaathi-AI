import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Advisory, DiseaseScan, Farm, FarmerProfile } from '../types';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Auth & Firestore with custom databaseId if configured
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Enum for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || 'unknown';
  
  const errorInfo: FirestoreErrorInfo = {
    error: `[${errCode}] ${errMessage}`,
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };

  console.error('Firestore Operation Failed:', JSON.stringify(errorInfo, null, 2));
  throw new Error(JSON.stringify(errorInfo));
}

// Clean undefined fields before writing to Firestore
function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// Auth API
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In popup error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

export async function signOutFarmer(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign-out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// User Profile in Firestore
export async function getOrCreateUserProfile(user: FirebaseUser): Promise<{ profile: FarmerProfile; farm: Farm }> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  
  try {
    const userDoc = await getDoc(userRef);
    let profile: FarmerProfile;
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      profile = {
        id: user.uid,
        name: data.name || user.displayName || 'Farmer',
        email: data.email || user.email || '',
        phone: data.phone || user.phoneNumber || '',
        photo_url: data.photo_url || user.photoURL || '',
        language: data.language || 'en',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } else {
      const now = new Date().toISOString();
      profile = {
        id: user.uid,
        name: user.displayName || 'Farmer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photo_url: user.photoURL || '',
        language: 'en',
        created_at: now,
        updated_at: now,
      };
      
      await setDoc(userRef, {
        id: user.uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        photo_url: profile.photo_url || '',
        created_at: now,
        updated_at: now,
      });
    }

    // Now look for existing farm for this user
    let farm = await getUserFarm(user.uid);
    if (!farm) {
      // Create initial default farm
      const farmId = 'farm-' + user.uid.substring(0, 10);
      farm = {
        id: farmId,
        user_id: user.uid,
        name: 'My Farm',
        crop_name: 'Wheat',
        acres: 2,
        soil_type: 'alluvial',
        growth_stage: 'vegetative',
        health_score: 88,
        district: 'Indore',
        state: 'Madhya Pradesh',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_demo: false,
      };
      await saveUserFarm(farm);
    }

    return { profile, farm };
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

// Get User Farm
export async function getUserFarm(userId: string): Promise<Farm | null> {
  const path = 'farms';
  try {
    const farmsRef = collection(db, 'farms');
    const q = query(farmsRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data() as Farm;
      return {
        name: 'My Farm',
        health_score: 85,
        ...docData,
        id: querySnapshot.docs[0].id,
      };
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save User Farm
export async function saveUserFarm(farm: Farm): Promise<void> {
  const path = `farms/${farm.id}`;
  try {
    const farmRef = doc(db, 'farms', farm.id);
    const farmData = cleanUndefined({
      id: farm.id,
      user_id: farm.user_id,
      name: farm.name || 'My Farm',
      crop_name: farm.crop_name,
      acres: Number(farm.acres) || 1,
      soil_type: farm.soil_type,
      growth_stage: farm.growth_stage,
      health_score: farm.health_score || 85,
      district: farm.district,
      state: farm.state,
      created_at: farm.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await setDoc(farmRef, farmData, { merge: true });
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Advisories
export async function getUserAdvisories(userId: string): Promise<Advisory[]> {
  const path = 'advisories';
  try {
    const ref = collection(db, 'advisories');
    const q = query(ref, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const results: Advisory[] = [];
    querySnapshot.forEach((d) => {
      results.push({ ...(d.data() as Advisory), id: d.id });
    });
    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserAdvisory(advisory: Advisory): Promise<void> {
  const path = `advisories/${advisory.id}`;
  try {
    const ref = doc(db, 'advisories', advisory.id);
    await setDoc(ref, cleanUndefined(advisory), { merge: true });
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserAdvisoryStatus(id: string, status: 'active' | 'completed'): Promise<void> {
  const path = `advisories/${id}`;
  try {
    const ref = doc(db, 'advisories', id);
    await updateDoc(ref, { status });
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserAdvisory(id: string): Promise<void> {
  const path = `advisories/${id}`;
  try {
    const ref = doc(db, 'advisories', id);
    await deleteDoc(ref);
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Scans
export async function getUserScans(userId: string): Promise<DiseaseScan[]> {
  const path = 'scans';
  try {
    const ref = collection(db, 'scans');
    const q = query(ref, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const results: DiseaseScan[] = [];
    querySnapshot.forEach((d) => {
      results.push({ ...(d.data() as DiseaseScan), id: d.id });
    });
    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserScan(scan: DiseaseScan): Promise<void> {
  const path = `scans/${scan.id}`;
  try {
    const ref = doc(db, 'scans', scan.id);
    await setDoc(ref, cleanUndefined(scan), { merge: true });
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Test Firestore Connection per Skill guidelines
export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently in offline mode');
    }
  }
}
testFirestoreConnection();
