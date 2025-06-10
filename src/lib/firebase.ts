
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  type Firestore, 
  serverTimestamp as originalServerTimestamp, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  increment, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  arrayRemove, 
  type Timestamp, 
  limit,
  documentId,
  addDoc as firestoreAddDoc, // Renamed to avoid conflict if we had a local addDoc
  deleteDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  type Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  type User as FirebaseUserType,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile // Added for updating auth user profile
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAo2sKaliAXr3SvcenZwbues6fjpYDCEEA",
    authDomain: "beyond-scans.firebaseapp.com",
    projectId: "beyond-scans",
    storageBucket: "beyond-scans.appspot.com", // Corrected from your provided .firebasestorage.app
    messagingSenderId: "1096743928524",
    appId: "1:1096743928524:web:fb747c737c647aed657869",
    measurementId: "G-R95ZZPLRJR"
  };

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

db = getFirestore(app);
auth = getAuth(app);
const serverTimestamp = originalServerTimestamp;
const addDoc = firestoreAddDoc; // Exporting the renamed firestoreAddDoc

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async (): Promise<{ user: FirebaseUserType; isNewUser: boolean; username: string | null } | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || !userDocSnap.data()?.username) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: userDocSnap.exists() ? userDocSnap.data()?.username || null : null,
        createdAt: userDocSnap.exists() ? userDocSnap.data()?.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { user, isNewUser: true, username: null };
    }
    return { user, isNewUser: false, username: userDocSnap.data()?.username };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.log("Google Sign-In: Popup closed by user.");
      return null;
    }
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};

const createUserWithEmailAndPasswordFirebase = async (email: string, password_param: string, username_param: string): Promise<FirebaseUserType> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password_param);
    const user = userCredential.user;
    // Create user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      username: username_param,
      displayName: username_param, // Use username as displayName initially
      photoURL: null, // No photoURL initially for email/pass users
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return user;
  } catch (error: any) {
    console.error("Error creating user with email and password:", error);
    throw error; // Re-throw for the component to handle
  }
};

const signInWithEmailAndPasswordFirebase = async (email: string, password_param: string): Promise<FirebaseUserType> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password_param);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in with email and password:", error);
    throw error; // Re-throw for the component to handle
  }
};

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { 
  app, 
  db, 
  auth, 
  serverTimestamp, 
  signInWithGoogle, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  createUserWithEmailAndPasswordFirebase,
  signInWithEmailAndPasswordFirebase,
  updateAuthProfile, // Exporting updateProfile from firebase/auth
  type FirebaseUserType as User 
};
export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  increment, 
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  arrayRemove, 
  type Timestamp, 
  limit,
  documentId,
  addDoc, // Now correctly exports the renamed firestoreAddDoc
  deleteDoc
};
