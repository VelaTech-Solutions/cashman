// extractDates.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const extractDates = async (clientId, bankName, type) => {
  if (!clientId || !bankName || !type) {
    console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }

  try {
    console.log(`🔄 Dates Extracted for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Dates Extracted", "processing");
    
    // Step 1: Get client data
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping date extraction.");
      return;
    }

    // Normalize type (e.g., "TypeA" → "typeA")
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

    // Step 3: Fetch date rules from Firestore
    const dateRulesSnap = await getDoc(bankRef);
    if (!dateRulesSnap.exists()) {
      console.warn(`⚠️ No date extraction rules found for bank: ${bankName}`);
    }
    const dateRules = dateRulesSnap.data() || {};

    // Step 4: Process lines
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];
    let totalDateLinesProcessed = 0;

    const extractDatesFromText = (text) => {
      const matches = [];

      for (const key in dateRules) {
        const rule = dateRules[key];
        if (rule?.pattern) {
          try {
            const regex = new RegExp(rule.pattern, "g");
            const found = text.match(regex);
            if (found) matches.push(...found);
          } catch (e) {
            console.warn(`❌ Invalid regex for key "${key}":`, e.message);
          }
        }
      }

      return matches;
    };

    filteredData.forEach((line, index) => {
      if (!line) return;

      const extractedDates = extractDatesFromText(line);

      if (extractedDates.length > 0) {
        totalDateLinesProcessed++;
      }

      const date1 = extractedDates[0] || null;
      const date2 = extractedDates[1] || "None";

      const strippedLine = extractedDates.reduce(
        (acc, date) => acc.replace(date, "").trim(),
        line
      );

      updatedFilteredData[index] = strippedLine || line;

      if (!updatedTransactions[index]) {
        updatedTransactions[index] = {};
      }

      updatedTransactions[index] = {
        ...updatedTransactions[index],
        date1,
        date2,
      };
    });

    // Step ✅: Save results to Firestore
    await updateDoc(clientRef, {
      filteredData: updatedFilteredData,
      transactions: updatedTransactions,
    });

    await ProgressUtils.updateProgress(clientId, "Dates Extracted", "success");
    console.log("🎉 Dates Extraction Completed!");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Dates Extracted", "failed");
    console.error("🔥 Error Dates Extracted:", error);
  }
};


export default extractDates;
