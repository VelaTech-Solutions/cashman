
// Firebase Imports
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from './ProgressUtils';

const resetClientDb = async (clientId) => {
  if (!clientId) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (clientSnap.exists()) {
      await updateDoc(clientRef, {
        transactions: [],
        filteredData: [],
        extractProgress: {},
        archive: [],
        progress: {},
        number_of_transactions: 0,
      });
    } else {
      await setDoc(clientRef, {
        transactions: [],
        filteredData: [],
        extractProgress: {},
        archive: [],
        progress: {},
        number_of_transactions: 0,
      });
    }

    await ProgressUtils.updateProgress(clientId, "Reset database structure", "success");
  } catch (error) {
    await ProgressUtils.updateProgress(clientId, "Reset database structure", "failed");
    console.error("🔥 Error initializing Firestore:", error);
  }
};

export default resetClientDb;
