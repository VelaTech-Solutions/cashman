// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractDescriptionVerify.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

const extractDescriptionVerify = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    const clientRef = doc(db, "clients", id);
    const settingsRef = doc(db, "settings", "description", bankName, "config");
    

    await updateDoc(clientRef, {
      "extractProgress.Descriptions Verified": "processing",
    });

    const [clientSnap, settingsSnap] = await Promise.all([
      getDoc(clientRef),
      getDoc(settingsRef),
    ]);

    if (!clientSnap.exists()) {
      await updateDoc(clientRef, {
        "extractProgress.Descriptions Verified": "failed",
      });
      return;
    }

    const { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      await updateDoc(clientRef, {
        "extractProgress.Descriptions Verified": "failed",
      });
      return;
    }


    // inside the settingsRef ok we have 
    // enabled = true/false this is the regex switch
    // pattern = "the regex" 
    // deletion = true/false does not save too description2
    // future feild to come
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

    // if (activePatterns.length === 0) {
    //   // No regex selected, just clean and copy
    //   transactions.forEach((txn, index) => {
    //     updatedTransactions[index] = {
    //       ...txn,
    //       description: txn.description?.trim() || "",
    //       description2: "",
    //     };
    //   });
    // } else {

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
    // }

    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      "extractProgress.Descriptions Verified": "success",
    });
  } catch (error) {
    await updateDoc(doc(db, "clients", id), {
      "extractProgress.Descriptions Verified": "failed",
    });
    console.error("🔥 Error verifying descriptions:", error);
  }
};

export default extractDescriptionVerify;