// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzp560ybsCr0NI0ZaNGpsWwFcRvzdQ7uM",
  authDomain: "get-my-mortgage-5a5c3.firebaseapp.com",
  projectId: "get-my-mortgage-5a5c3",
  storageBucket: "get-my-mortgage-5a5c3.firebasestorage.app",
  messagingSenderId: "72109758153",
  appId: "1:72109758153:web:a4eb01dd268d483c4d5f18",
  measurementId: "G-F1M6F6K5Y2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;