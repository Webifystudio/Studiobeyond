
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth, type Auth } from 'firebase/auth'; // Add if you need Firebase Auth
// import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Add if you need Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCOPDqKGjZnsbY4zYWsJoVNVvKD-KS5H2Q",
  authDomain: "studio-beyond-b38c2.firebaseapp.com",
  databaseURL: "https://studio-beyond-b38c2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-beyond-b38c2",
  storageBucket: "studio-beyond-b38c2.firebasestorage.app",
  messagingSenderId: "617421665131",
  appId: "1:617421665131:web:db1aa35c0a54f71541d22e"
};

let app: FirebaseApp;
let db: Firestore;
// let auth: Auth;
// let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

db = getFirestore(app);
// auth = getAuth(app); // Initialize Auth if needed
// storage = getStorage(app); // Initialize Storage if needed

export { app, db /*, auth, storage */ };

// Note: For production applications, it's highly recommended to store your 
// API keys and other sensitive configuration in environment variables 
// (e.g., using a .env.local file) rather than hardcoding them directly in the source code.
