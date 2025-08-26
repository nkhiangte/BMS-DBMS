// src/firebaseConfig.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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

// --- Enable Offline Persistence ---
// This allows the app to work offline by caching data.
// It should be enabled before any other Firestore operations.
db.enablePersistence()
  .then(() => {
    console.log("Firestore persistence enabled successfully. The app can now work offline.");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
        // This can happen if you have multiple tabs open, as persistence can only be
        // enabled in one tab at a time.
        console.warn('Firestore persistence failed: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence.
        console.warn('Firestore persistence is not available in this browser.');
    } else {
        console.error("Firestore persistence failed with an unexpected error: ", err);
    }
});


// Export for use in your app
export { auth, db, firebaseConfig };