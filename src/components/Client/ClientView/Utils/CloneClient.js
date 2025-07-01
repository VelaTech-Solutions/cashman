// Utils/CloneClient.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

export const handleCloneClient = async (clientId) => {
  if (!clientId) throw new Error("No Client ID");

  // Get the original client doc
  const originalRef = doc(db, "clients", clientId);
  const originalSnap = await getDoc(originalRef);

  if (!originalSnap.exists()) {
    throw new Error("Original client does not exist");
  }

  const originalData = originalSnap.data();

  // Create a new ID for the clone
  const clonedId = `${clientId}dev`;

  const clonedRef = doc(db, "clients", clonedId);

  // Set the clone with the same data (or modify as needed)
  await setDoc(clonedRef, {
    ...originalData,
    clonedFrom: clientId,
    dateCreated: new Date(), // Optional: refresh creation date
  });
};
