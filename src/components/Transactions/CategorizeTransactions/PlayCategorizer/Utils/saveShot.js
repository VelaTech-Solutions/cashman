import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

export const saveShot = async ({ id, description, category, subcategory, timestamp }) => {
  if (!id) {
    console.error("Missing client ID");
    return;
  }

  const clientRef = doc(db, "clients", id);

  const shot = {
    description,
    category,
    subcategory,
    timestamp,
  };

  try {
    await updateDoc(clientRef, {
      ptransactions: arrayUnion(shot),
    });
    console.log("✅ Shot saved successfully to client's ptransactions");
  } catch (error) {
    console.error("❌ Error saving shot:", error);
  }
};
