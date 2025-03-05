import firestore from "./index.js";
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
  onSnapshot,
} from "firebase/firestore";

export const getAgenda = async () => {
  try {
    const q = query(collection(firestore, "services"));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return data;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

export const createCard = async (card) => {
  try {
    const docRef = await addDoc(collection(firestore, "services"), {
      ...card,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
