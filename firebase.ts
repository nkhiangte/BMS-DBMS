import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// IMPORTANT: Replace with your app's Firebase project configuration.
// To find this, go to the Firebase Console, open your project,
// go to Project Settings (gear icon) and scroll down to "Your apps".
// Click the "</>" icon to find your web app's config.
const firebaseConfig = {
    apiKey: "AIzaSyCxE7ucaUEcvdDfeOO7CWX-lAgdecWZNLE",
  authDomain: "bmsdb-4918a.firebaseapp.com",
  projectId: "bmsdb-4918a",
  storageBucket: "bmsdb-4918a.firebasestorage.app",
  messagingSenderId: "351220627913",
  appId: "1:351220627913:web:1ec56c71506df6cc995018",
  measurementId: "G-FBG9BEQ1C3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// Using initializeFirestore with experimentalForceLongPolling to help with
// potential network issues (like firewalls) that might block WebSockets.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
