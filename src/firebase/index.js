// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyD4xtz_KMaAqw31LGduGEw614v3-AoDypM",
  authDomain: "app-agenda-conectnet.firebaseapp.com",
  projectId: "app-agenda-conectnet",
  storageBucket: "app-agenda-conectnet.firebasestorage.app",
  messagingSenderId: "212243071956",
  appId: "1:212243071956:web:b984d00b79118f09bdcc41",
  measurementId: "G-HSX4EJ1QMK",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);

const auth = getAuth(firebase);

const firestore = getFirestore(firebase);

export { auth, onAuthStateChanged };

// if (import.meta.env.MODE === "development") {
//   connectFirestoreEmulator(firestore, "localhost", 8080);
// }

export default firestore;
