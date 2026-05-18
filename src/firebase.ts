import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARINAjRAGQh8rHvMnitLvfjUqAGKAI1gY",
  authDomain: "water-mangament-system.firebaseapp.com",
  projectId: "water-mangament-system",
  storageBucket: "water-mangament-system.firebasestorage.app",
  messagingSenderId: "289208525587",
  appId: "1:289208525587:web:eab936a5e91f27a139b0e6",
  measurementId: "G-12R48J1LGE"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
