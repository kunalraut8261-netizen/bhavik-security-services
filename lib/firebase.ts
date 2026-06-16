import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdvHYSZrip1ymL1tUf4AEUfxLf0vFUzNY",
  authDomain: "bhavik-security-services.firebaseapp.com",
  projectId: "bhavik-security-services",
  storageBucket: "bhavik-security-services.firebasestorage.app",
  messagingSenderId: "646253220246",
  appId: "1:646253220246:web:886c53a6c2ba0c18be8db7",
  measurementId: "G-4GC7DVD182"
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

if (typeof window !== "undefined") {
  const g = window as Window & typeof globalThis & {
    _firebase_app?: FirebaseApp;
    _firebase_db?: Firestore;
    _firebase_storage?: FirebaseStorage;
    _firebase_auth?: Auth;
  };
  if (!g._firebase_app) {
    g._firebase_app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    g._firebase_db = getFirestore(g._firebase_app);
    g._firebase_storage = getStorage(g._firebase_app);
    g._firebase_auth = getAuth(g._firebase_app);
  }
  app = g._firebase_app as FirebaseApp;
  db = g._firebase_db as Firestore;
  storage = g._firebase_storage as FirebaseStorage;
  auth = g._firebase_auth as Auth;
} else {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

export { db, storage, auth };
