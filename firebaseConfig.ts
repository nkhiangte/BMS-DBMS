import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp4xXM_52Lu4W8NyxTn1aGo9US_JKF4XA",
  authDomain: "bmsdb-b39a2.firebaseapp.com",
  projectId: "bmsdb-b39a2",
  storageBucket: "bmsdb-b39a2.appspot.com",
  messagingSenderId: "58518396073",
  appId: "1:58518396073:web:c42ce146d444ba38f5ddb8",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db, firebase, firebaseConfig };
