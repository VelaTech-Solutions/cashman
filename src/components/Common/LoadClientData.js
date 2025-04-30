// src/components/LoadClientData.js

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Import your Firestore instance

// Function to load client data based on ID number
const LoadClientData = async (clientId) => {
  try {
    if (!clientId)
      throw new Error("ID number is required to fetch client data.");

    // console.log("Fetching client data for ID:", clientId);

    // Reference the client's document in Firestore
    const clientDocRef = doc(db, "clients", clientId);
    const clientDocSnap = await getDoc(clientDocRef);

    if (!clientDocSnap.exists()) {
      throw new Error("Client not found.");
    }

    // Return the client's data
    return clientDocSnap.data();
  } catch (err) {
    console.error("Error loading client data:", err.message);
    throw err; // Re-throw the error for handling elsewhere
  }
};

export default LoadClientData;
