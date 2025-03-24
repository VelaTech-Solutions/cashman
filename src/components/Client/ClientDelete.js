


// src/components/Client/ClientDelete.js
// function only  by id
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export const handleDeleteClient = async (id) => {
  if (!id) {
    console.error("❌ No client ID provided.");
    return;
  }

  try {
    await deleteDoc(doc(db, "clients", id));
    console.log(`✅ Client with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error("🔥 Error deleting client:", error);
  }
};
