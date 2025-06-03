// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractDates.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../Utils/ProgressUtils";

const extractDates = async (clientId, bankName) => {
  if (!clientId || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(`🔄 Dates Extracted for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Dates Extracted", "processing");
    // Get date rules for this bank
    const bankRef = doc(db, "settings", "dates", bankName, "config");

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", clientId);

    // Step 2: Fetch client data
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


    // Step 5: Save results to Firestore
    await updateDoc(clientRef, {
      filteredData: updatedFilteredData,
      transactions: updatedTransactions,
      "extractProgress.Dates Extracted": "success",
    });

    console.log(`✅ Total Lines with Dates Processed: ${totalDateLinesProcessed}`);
    console.log("🎉 Date Extraction Completed!");

  } catch (error) {
    console.error("🔥 Error Dates Extracted:", error);
    await updateDoc(doc(db, "clients", clientId), {
      "extractProgress.Dates Extracted": "failed",
    });
  }
};

export default extractDates;
