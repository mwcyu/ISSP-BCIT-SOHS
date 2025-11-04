// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3VQIysZoJVcPrJWNZiOjzyNmRLcJ7uW0",
  authDomain: "bcit-sohs.firebaseapp.com",
  projectId: "bcit-sohs",
  storageBucket: "bcit-sohs.firebasestorage.app",
  messagingSenderId: "467688828767",
  appId: "1:467688828767:web:852dc5f654b638bb3250ea",
  measurementId: "G-WR70VWKNZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);