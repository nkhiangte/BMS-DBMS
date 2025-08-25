// Import only what you need
import { initializeApp, FirebaseApp } from "@firebase/app";
import { getAuth, Auth } from "@firebase/auth";
import { getFirestore, Firestore } from "@firebase/firestore";

// =================================================================================
// IMPORTANT - Firebase Configuration
// =================================================================================
// This is a placeholder configuration. You MUST replace the values below with
// the actual configuration from YOUR Firebase project. An invalid configuration
// here will cause the application to freeze or fail on login.
//
// To get your Firebase config:
// 1. Go to the Firebase Console (https://console.firebase.google.com/).
// 2. Select your project (or create a new one).
// 3. Go to Project Settings (click the gear icon).
// 4. In the "General" tab, scroll down to "Your apps".
// 5. If you haven't created a web app, create one.
// 6. Find your web app and click the "SDK setup and configuration" option.
// 7. Select "Config" and copy the `firebaseConfig` object.
// 8. Paste the copied object here, replacing these placeholder values.
// =================================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Check if the configuration has been updated from the placeholder values.
export const isFirebaseConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

if (!isFirebaseConfigured) {
    console.warn(
        "Firebase configuration is incomplete. Please replace the placeholder values in `firebaseConfig.ts` with your actual project credentials. The app will not function correctly until this is done."
    );
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get instances of Firebase services.
// It's a good practice to get them once and export them for use throughout the app.
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { db, auth };