// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
 apiKey: "AIzaSyDpQP1vLL62y7sTyGlSePC5vTNTf8EzDak",
 authDomain: "ccgroup-99075.firebaseapp.com",
 databaseURL: "https://ccgroup-99075-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "ccgroup-99075",
 storageBucket: "ccgroup-99075.firebasestorage.app",
 messagingSenderId: "984635139202",
 appId: "1:984635139202:web:721cf2fd71610c4b45409b",
 measurementId: "G-418E5CEVD0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);