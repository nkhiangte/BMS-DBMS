// Import only what you need
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

// Your Firebase configuration
// TODO: Add your own Firebase configuration from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyCxE7ucaUEcvdDfeOO7CWX-lAgdecWZNLE",
  authDomain: "bmsdb-4918a.firebaseapp.com",
  databaseURL: "https://bmsdb-4918a-default-rtdb.firebaseio.com",
  projectId: "bmsdb-4918a",
  storageBucket: "bmsdb-4918a.firebasestorage.app",
  messagingSenderId: "351220627913",
  appId: "1:351220627913:web:1ec56c71506df6cc995018",
  measurementId: "G-FBG9BEQ1C3"
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore();
const auth = getAuth();

export { db, auth };