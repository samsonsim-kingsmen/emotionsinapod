import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZYOtn_4eMF-Im3c2bWTHqTSRDY3E4evw",
  authDomain: "giftest-e5219.firebaseapp.com",
  projectId: "giftest-e5219",
  storageBucket: "giftest-e5219.firebasestorage.app",
  messagingSenderId: "30830038179",
  appId: "1:30830038179:web:77919884542282a3860316",
  measurementId: "G-83CY6WMZJ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
