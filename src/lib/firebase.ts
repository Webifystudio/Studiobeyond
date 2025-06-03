
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore, serverTimestamp as originalServerTimestamp, collection, doc, setDoc, getDoc, getDocs, updateDoc, increment, query, where, orderBy, arrayUnion, arrayRemove, type Timestamp, limit } from 'firebase/firestore'; // Added getDocs, updateDoc, increment, query, where, orderBy, arrayUnion, arrayRemove, Timestamp, limit
import { getAuth, type Auth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
// import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Add if you need Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCOPDqKGjZnsbY4zYWsJoVNVvKD-KS5H2Q",
  authDomain: "studio-beyond-b38c2.firebaseapp.com",
  databaseURL: "https://studio-beyond-b38c2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-beyond-b38c2",
  storageBucket: "studio-beyond-b38c2.appspot.com",
  messagingSenderId: "617421665131",
  appId: "1:617421665131:web:db1aa35c0a54f71541d22e"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
// let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

db = getFirestore(app);
auth = getAuth(app);
const serverTimestamp = originalServerTimestamp;
// storage = getStorage(app); // Initialize Storage if needed

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Check if user exists in Firestore 'users' collection
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || !userDocSnap.data()?.username) { // Check if username is missing too
      // New user or user without username, save/update basic info
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: userDocSnap.exists() ? userDocSnap.data()?.username || null : null, // Preserve existing username if any, else null
        createdAt: userDocSnap.exists() ? userDocSnap.data()?.createdAt : serverTimestamp(), // Preserve existing createdAt
        updatedAt: serverTimestamp()
      }, { merge: true }); // Use merge:true to avoid overwriting existing fields like createdAt
      return { user, isNewUser: true, username: null };
    }
    return { user, isNewUser: false, username: userDocSnap.data()?.username };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
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

export { app, db, auth, serverTimestamp, signInWithGoogle, signOut, onAuthStateChanged, GoogleAuthProvider, type User };
// Exporting Firestore functions for direct use
export { collection, doc, setDoc, getDoc, getDocs, updateDoc, increment, query, where, orderBy, arrayUnion, arrayRemove, type Timestamp, limit };

// Note: For production applications, it's highly recommended to store your 
// API keys and other sensitive configuration in environment variables 
// (e.g., using a .env.local file) rather than hardcoding them directly in the source code.

