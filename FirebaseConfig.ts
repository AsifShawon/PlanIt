// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP6wj6d30OqG2x211EebfIMnZk2f2geM8",
  authDomain: "planit-today.firebaseapp.com",
  projectId: "planit-today",
  storageBucket: "planit-today.firebasestorage.app",
  messagingSenderId: "49249966482",
  appId: "1:49249966482:web:ac66b88b8a0af2aec2894b",
  measurementId: "G-RS76TB58PT"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);