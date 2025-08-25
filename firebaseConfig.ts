// Import only what you need
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

// Your Firebase configuration
// IMPORTANT: Replace these placeholder values with your project's actual Firebase configuration.
// You can find this in the Firebase Console under Project Settings > General > Your apps > Web app.
const firebaseConfig = {
  apiKey: "AIzaSyCxE7ucaUEcvdDfeOO7CWX-lAgdecWZNLE",
  authDomain: "bmsdb-4918a.firebaseapp.com",
  projectId: "bmsdb-4918a",
  storageBucket: "bmsdb-4918a.firebasestorage.app",
  messagingSenderId: "351220627913",
  appId: "1:351220627913:web:1ec56c71506df6cc995018"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };