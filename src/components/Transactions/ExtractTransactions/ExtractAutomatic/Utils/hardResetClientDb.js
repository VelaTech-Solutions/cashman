import { doc, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import ProgressUtils from './ProgressUtils';

const hardResetClientDb = async (clientId) => {
  if (!clientId) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    const fieldsToDelete = {
      rawData: deleteField(),
      transactions: deleteField(),
      filteredData: deleteField(),
      extractProgress: deleteField(),
      archive: deleteField(),
      progress: deleteField(),
      categorized: deleteField(),
      number_of_transactions: deleteField(),
      processedReports: deleteField(),
      budgetData: deleteField(),
      rawDataMetadata: deleteField(),
      cleanedData: deleteField(),
      ptransactions: deleteField(),
      sTransactions: deleteField(),
    };

    if (clientSnap.exists()) {
      await updateDoc(clientRef, fieldsToDelete);
    } else {
      // Optional: set a blank doc or omit this
      await setDoc(clientRef, {});
    }

    //await ProgressUtils.updateProgress(clientId, "Reset database structure", "success");
  } catch (error) {
    await ProgressUtils.updateProgress(clientId, "Reset database structure", "failed");
    console.error("🔥 Error resetting Firestore fields:", error);
  }
};

export default hardResetClientDb;
