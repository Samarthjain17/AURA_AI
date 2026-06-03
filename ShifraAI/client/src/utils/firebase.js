// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aura-ai-71a17.firebaseapp.com",
  projectId: "aura-ai-71a17",
  storageBucket: "aura-ai-71a17.firebasestorage.app",
  messagingSenderId: "677590255056",
  appId: "1:677590255056:web:fc989e4831d38e7d24e5d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();