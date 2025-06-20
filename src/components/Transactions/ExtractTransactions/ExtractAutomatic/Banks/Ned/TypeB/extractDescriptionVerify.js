import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";
import ProgressUtils from "../../../Utils/ProgressUtils";
const extractDescriptionVerify = async (clientId, bankName) => {
  if (!clientId || !bankName) return console.error("❌ Missing Client ID or Bank Name");

  try {
    console.log(`🔄 Verifying Descriptions for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Descriptions Verified", "processing");

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", clientId);
    const settingsRef = doc(db, "settings", "description", bankName, "config");
    
    const [clientSnap, settingsSnap] = await Promise.all([
      getDoc(clientRef),
      getDoc(settingsRef),
    ]);

    if (!clientSnap.exists()) {
      console.error("❌ No Client data found");
      await ProgressUtils.updateProgress(clientId, "Descriptions Verified", "failed");
      return;
    }

    const { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      console.error("❌ No filtered data found");
      await ProgressUtils.updateProgress(clientId, "Descriptions Verified", "failed");
      return;
    }

    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};
    console.log("📋 Description Settings Selected:");
    Object.entries(settingsData).forEach(([key, val]) => {
      console.log(`- ${key}: ${val?.enabled ? "✅ enabled" : "❌ disabled"}`);
    });

    const activePatternConfigs = Object.entries(settingsData)
    .filter(([_, val]) => val?.enabled && val?.pattern)
    .map(([_, val]) => ({
      regex: new RegExp(val.pattern, "g"),
      deletion: val.deletion || false,
    }));
  

    const updatedTransactions = [...transactions];

    // Apply regex patterns
    transactions.forEach((txn, index) => {
      let description = txn.description?.trim();
      if (!description) return;
    
      const description2 = [];
    
      activePatternConfigs.forEach(({ regex, deletion }) => {
        const matches = [...(description.match(regex) || [])];
        if (matches.length > 0) {
          if (!deletion) {
            description2.push(...matches);
          }
          matches.forEach((match) => {
            description = description.replace(match, "").trim();
          });
        }
      });
    
      // Convert the description to lowercase
      description = description.toLowerCase();
    
      updatedTransactions[index] = {
        ...txn,
        description,
        description2: description2.length ? description2.join(" | ") : "",
      };
    });    

    await updateDoc(clientRef, {
      transactions: updatedTransactions,
    });

    await ProgressUtils.updateProgress(clientId, "Descriptions Verified", "success");
    console.log("🎉 Descriptions verified successfully.");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Descriptions Verified", "failed");
    console.error("🔥 Error verifying descriptions:", error);
  }
};

export default extractDescriptionVerify;