// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// UUID Imports
import { v4 as uuidv4 } from "uuid";

// Component Imports
import ProgressUtils from './ProgressUtils';

// Define the structure of a default transaction with all necessary fields (without UID)
const defaultTransaction = {
  date1: null,
  date2: null,
  original: "",
  category: "",
  subcategory: "",
  verified: "",
  description: "",
  description2: "",
  cleaned: false,
  fees_type: null,
  fees_amount: 0.0,
  debit_amount: 0.0,
  credit_amount: 0.0,
  credit_debit_amount: 0.0,
  balance_amount: 0.0,
};

const verifyDatabase = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", id);
    const clientSnap = await getDoc(clientRef);

    await ProgressUtils.updateProgress(id, "Verifying Database", "processing");

    if (clientSnap.exists()) {
      const clientData = clientSnap.data();

      // Ensure every transaction has all required fields and a unique UID
      if (clientData.transactions && Array.isArray(clientData.transactions)) {
        const updatedTransactions = clientData.transactions.map((tx) => {
          // Merge the default transaction fields and the existing transaction
          const updatedTx = { ...defaultTransaction, ...tx };

          // If the transaction doesn't have a UID, generate one
          if (!tx.uid) {
            updatedTx.uid = uuidv4();
          }
          return updatedTx;
        });

        // Now, save the updated transactions back to Firestore
        await updateDoc(clientRef, {
          transactions: updatedTransactions,
        });
        await ProgressUtils.updateProgress(id, "Verifying Database", "success");
        console.log("✅ All transactions now have the required fields and unique UID");
        return clientData; // Return client data if needed
      } else {
        console.error("❌ No transactions found in client data");
      }
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    await ProgressUtils.updateProgress(id, "Verifying Database", "failed");
    console.error("Error loading client data:", error);
    throw error;
  }
};

export default verifyDatabase;
