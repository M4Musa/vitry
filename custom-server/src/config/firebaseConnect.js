// shared/utils/firebase.js
const { initializeApp } = require("firebase/app");
const { getStorage, ref, listAll } = require("firebase/storage"); // Import ref and listAll

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNCGsSyym4xbssps-ejOObwbgBRHKUkdM",
  authDomain: "vi-try.firebaseapp.com",
  projectId: "vi-try",
  storageBucket: "vi-try.appspot.com",
  messagingSenderId: "713734149855",
  appId: "1:713734149855:web:ae9da279c4a6715ff37b6a",
  measurementId: "G-2WVWGYFNW6", // Optional, remove if not needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Firebase Storage service

const checkFirebaseConnection = async () => {
    try {
      const storageRef = ref(storage); // Create a reference to the root of the storage
      // Checking if we can access Firebase storage
      await listAll(storageRef); // List all items in the storage reference
      console.log("Connected to Firebase Storage");
    } catch (error) {
      console.error("Firebase connection failed:", error);
      throw error;
    }
  };

module.exports = { app, storage, checkFirebaseConnection };
