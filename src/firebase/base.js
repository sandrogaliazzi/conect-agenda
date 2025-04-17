import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "app-agenda-conectnet",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CREATE ---
async function createTodo(title) {
  try {
    const docRef = await addDoc(collection(db, "todos"), {
      title: title,
      completed: false,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// --- READ ---
async function getAllTodos() {
  try {
    const q = query(collection(db, "todos"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
}

// --- READ (Single Document) ---
async function getTodoById(id) {
  try {
    const docRef = doc(db, "todos", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error getting document:", e);
  }
}

// --- UPDATE ---
async function updateTodo(id, data) {
  try {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { ...data });
    console.log("Todo updated successfully!");
  } catch (e) {
    console.error("Error updating todo:", e);
  }
}

// --- DELETE ---
async function deleteTodo(id) {
  try {
    await deleteDoc(doc(db, "todos", id));
    console.log("Todo deleted successfully!");
  } catch (e) {
    console.error("Error deleting todo:", e);
  }
}

// Example Usage:
createTodo("Buy groceries");
getAllTodos();
getTodoById("YOUR_TODO_ID"); // Replace with a real ID from your Firestore database
updateTodo("YOUR_TODO_ID", true); // Replace with a real ID
deleteTodo("YOUR_TODO_ID"); //Replace with a real ID
