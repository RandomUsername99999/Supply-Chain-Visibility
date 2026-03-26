// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
 apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
 authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
 databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
 projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
 storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
 appId: process.env.REACT_APP_FIREBASE_APP_ID,
 measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
// Primary app — used for admin session
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app — used ONLY for creating new user accounts.
// This prevents the admin from being signed out when registering a new user.
const appSecondary = initializeApp(firebaseConfig, "Secondary");
export const authSecondary = getAuth(appSecondary);