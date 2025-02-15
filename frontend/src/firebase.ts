// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa6NAMB-4yJYhDbmUJ2Wd78Xp-6e6xrn0",
  authDomain: "gradient-3b33e.firebaseapp.com",
  projectId: "gradient-3b33e",
  storageBucket: "gradient-3b33e.firebasestorage.app",
  messagingSenderId: "984729444793",
  appId: "1:984729444793:web:7e8cf0a88f9af1e37cd668",
  measurementId: "G-CWBE4Z7HJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app); 

