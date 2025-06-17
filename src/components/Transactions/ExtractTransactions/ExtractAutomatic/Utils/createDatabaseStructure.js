
// Firebase Imports
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// UUID Imports
import { v4 as uuidv4 } from "uuid";

// Component Imports
import ProgressUtils from './ProgressUtils';

const createDatabaseStructure = async (clientId) => {
  if (!clientId) {
    console.error("❌ Missing Client ID");
    return;
  }

  const clientRef = doc(db, "clients", clientId);
  const clientSnap = await getDoc(clientRef);

  const defaultTransaction = {
    uid: uuidv4(),   // 🔐 Add UID
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
  try {
    await ProgressUtils.updateProgress(clientId, "Creating database structure", "processing");

    if (!clientSnap.exists()) {
      await setDoc(clientRef, {
        transactions: [defaultTransaction],
        archive: [], 
        processedReports: [],
        extractProgress: {},
      });
    } else {
      
      const data = clientSnap.data();

      const updatedTransactions = data.transactions
        ? data.transactions.map((txn) => ({
          ...txn, 
          ...defaultTransaction 
          }))
        : [defaultTransaction];
  
      await updateDoc(clientRef, {
        transactions: updatedTransactions,
        archive: data.archive ?? [],
        processedReports: data.processedReports ?? [],
        extractProgress: data.extractProgress ?? {},
      });
    }

    await ProgressUtils.updateProgress(clientId, "Creating database structure", "success");
  } catch (error) {
    await ProgressUtils.updateProgress(clientId, "Creating database structure", "failed");
    console.error("🔥 Error initializing Firestore:", error);
  }
};

export default createDatabaseStructure;
