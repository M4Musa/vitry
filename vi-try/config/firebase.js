// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCNCGsSyym4xbssps-ejOObwbgBRHKUkdM",
  authDomain: "vi-try.firebaseapp.com",
  projectId: "vi-try",
  storageBucket: "vi-try.appspot.com",
  messagingSenderId: "713734149855",
  appId: "1:713734149855:web:ae9da279c4a6715ff37b6a",
  measurementId: "G-2WVWGYFNW6", // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Storage service
const storage = getStorage(app);

export { storage };
