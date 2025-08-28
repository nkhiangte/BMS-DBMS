// src/firebaseConfig.ts
// FIX: Switched to Firebase compat imports to match usage in the app.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// 🔑 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBp4xXM_52Lu4W8NyxTn1aGo9US_JKF4XA",
  authDomain: "bmsdb-b39a2.firebaseapp.com",
  projectId: "bmsdb-b39a2",
  storageBucket: "bmsdb-b39a2.appspot.com",
  messagingSenderId: "58518396073",
  appId: "1:58518396073:web:c42ce146d444ba38f5ddb8",
};

// 🚀 Initialize Firebase
// FIX: Use compat initialization syntax and check if already initialized to prevent errors on hot-reload.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 🔐 Auth & Database
// FIX: Export auth and db instances from compat firebase
export const auth = firebase.auth();
export const db = firebase.firestore();

// Export the firebase object itself for compat syntax usage
export { firebase, firebaseConfig };
