// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// UUID Imports
import { v4 as uuidv4 } from "uuid";

// Component Imports
import ProgressUtils from '../../../Utils/ProgressUtils';

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

const verifyDatabase = async (clientId) => {
  if (!clientId) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    await ProgressUtils.updateProgress(clientId, "Verifying Database", "processing");

    if (clientSnap.exists()) {
      const clientData = clientSnap.data();

      if (clientData.transactions && Array.isArray(clientData.transactions)) {
        const uidSet = new Set();
        const updatedTransactions = clientData.transactions.map((tx) => {
          const updatedTx = { ...defaultTransaction, ...tx };

          let uid = tx.uid || uuidv4();
          while (uidSet.has(uid)) {
            uid = uuidv4();
          }

          uidSet.add(uid);
          updatedTx.uid = uid;
          updatedTx.id = uid;

          return updatedTx;
        });

        await updateDoc(clientRef, {
          number_of_transactions: updatedTransactions.length,
        });


        await updateDoc(clientRef, {
          transactions: updatedTransactions,
        });

        await ProgressUtils.updateProgress(clientId, "Verifying Database", "success");
        console.log("✅ Transactions verified with unique uid and id");
        return clientData;
      } else {
        console.error("❌ No transactions found in client data");
      }
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    await ProgressUtils.updateProgress(clientId, "Verifying Database", "failed");
    console.error("Error loading client data:", error);
    throw error;
  }
};


export default verifyDatabase;
