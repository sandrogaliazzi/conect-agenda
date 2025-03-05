// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const firestore = getFirestore(firebase);

export default firestore;
