// src/firebaseConfig.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp4xXM_52Lu4W8NyxTn1aGo9US_JKF4XA",
  authDomain: "bmsdb-b39a2.firebaseapp.com",
  projectId: "bmsdb-b39a2",
  storageBucket: "bmsdb-b39a2.appspot.com",
  messagingSenderId: "58518396073",
  appId: "1:58518396073:web:c42ce146d444ba38f5ddb8",
};

// Initialize Firebase - check if it's already initialized to avoid errors
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and export services using the compat syntax
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in your app
export { auth, db, storage, firebaseConfig };
