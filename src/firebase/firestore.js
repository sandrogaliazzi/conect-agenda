import firestore from "./index.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  setDoc,
  limit,
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

    // Evita update desnecessário
    const currentDoc = await getDoc(cardRef);
    if (
      currentDoc.exists() &&
      JSON.stringify(currentDoc.data()) === JSON.stringify(data)
    ) {
      console.log("Os dados são idênticos, atualização evitada.");
      return;
    }

    // Ajusta `is_complete`
    if (Array.isArray(data.cards)) {
      data.cards = data.cards.map((card) => ({
        ...card,
        is_complete: card.is_complete !== undefined ? card.is_complete : false,
      }));
    }

    // Remove campos undefined
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await updateDoc(cardRef, cleanedData);
    console.log("Card atualizado com sucesso!");
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
      orderBy("order", "asc")
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

export const setFirestoreDoc = async (docId, data, collectionName) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, data);
    console.log(
      `Documento ${docId} salvo com sucesso na coleção ${collectionName}`
    );
  } catch (error) {
    console.error("Erro ao salvar o documento:", error);
  }
};
