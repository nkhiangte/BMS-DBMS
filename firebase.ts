// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);