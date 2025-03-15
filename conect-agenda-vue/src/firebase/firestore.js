import firestore from "./index.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
} from "firebase/firestore";

export const getFirestoreCollectionDocs = async (collectionName) => {
  try {
    const q = query(collection(firestore, collectionName));
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

export const createFirestoreDoc = async (data, collectionName) => {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
    });
    await updateFirestoreDoc(docRef.id, { id: docRef.id }, collectionName);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateFirestoreDoc = async (id, data, collectionName) => {
  try {
    const cardRef = doc(firestore, collectionName, id);
    await updateDoc(cardRef, { ...data });
    console.log("Card atualizado successfully!");
  } catch (e) {
    console.error("Error updating card:", e);
  }
};

export const randomId = () => {
  return doc(collection(firestore, "tags")).id;
};

export const randomServicesId = () => {
  return doc(collection(firestore, "services")).id;
};

export const deleteFirestoreDoc = async (
  id,
  collectionName,
  noConfirmation
) => {
  try {
    if (noConfirmation) {
      await deleteDoc(doc(firestore, collectionName, id));
      console.log("Document deleted successfully!");
    } else {
      if (!confirm("Confirmar exclusão?")) return;
      await deleteDoc(doc(firestore, collectionName, id));
      console.log("Document deleted successfully!");
    }
  } catch (e) {
    console.error("Error deleting Document:", e);
  }
};

export const getDocumentsByAgendaId = async (id) => {
  try {
    const q = query(
      collection(firestore, "services"),
      where("agenda_id", "==", id),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);

    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return data;
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return [];
  }
};
