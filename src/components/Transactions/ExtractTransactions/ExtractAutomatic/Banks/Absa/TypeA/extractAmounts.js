// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractAmounts.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

import ProgressUtils from "../../../Utils/ProgressUtils";

const extractAmounts = async (clientId, bankName, type) => {
  if (!clientId || !bankName || !type) {
    console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }

  console.log("typebefore", type);
  try {
    console.log(`🔄 Amounts Extracted for Client: ${clientId} | Bank: ${bankName}`);

    await ProgressUtils.updateProgress(clientId, "Amounts Extracted", "processing");
    
    // Step 1: Get client data
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }


    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping Amount extraction.");
      return;
    }

    // Normalize type (e.g., "TypeA" → "typeA")
    console.log("typebefore", type)
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);
    console.log("typeKey",typeKey);

    // Step 2: Fetch config for this bank and type
    const configRef = doc(db, "settings", "bankOptions", bankName, "config");
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      console.warn(`⚠️ No config found for bank: ${bankName}`);
      return;
    }

    const configData = configSnap.data();
    const amountRegex = configData?.[typeKey]?.amountRegex;

    if (!amountRegex) {
      console.warn(`⚠️ No amountRegex found for type "${typeKey}" in bank "${bankName}"`);
      return;
    }

    // Step 3: Extractor
    const extractAmountsFromText = (text) => {
      const matches = [];
      try{
        const regex = new RegExp(amountRegex, "g");
        const found = text.match(regex);
        if (found) matches.push(...found);
      } catch (e) {
        console.warn(`❌ Invalid regex:`, e.message);
      }
      return matches;
    };
    
    // Count the Matches and console log it
    let totalMatches = 0;
    filteredData.forEach((line) => {
      const matches = extractAmountsFromText(line);
      totalMatches += matches.length;
    });
    console.log("Total Match Amounts:", totalMatches);

    // Step 4: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];
    let totalAmountsLinesProcessed = 0;

    filteredData.forEach((line, index) => {
      if (!line) return;

      const extracted = extractAmountsFromText(line);

      if (extracted.length > 0) {
        totalAmountsLinesProcessed++;
      }

      // Extract first and second amounts (safe fallback to "0.00")
      const credit_debit_amount = extracted[0] || "0.00";
      const balance_amount = extracted[1] || "0.00";

      // strip the letter words spaces from both amounts
      const credit_debit_amountStripped = credit_debit_amount.replace(/[a-zA-Z\s]/g, "");
      const balance_amountStripped = balance_amount.replace(/[a-zA-Z\s]/g, "");



      // Strip all matched amounts from the line
      const strippedLine = extracted.reduce(
        (acc, amount) => acc.replace(amount, "").trim(),
        line
      );

      updatedFilteredData[index] = strippedLine || line;

      if (!updatedTransactions[index]) {
        updatedTransactions[index] = {};
      }

      updatedTransactions[index] = {
        ...updatedTransactions[index],
        credit_debit_amount: credit_debit_amountStripped,
        balance_amount: balance_amountStripped,
      };
    });

    // Step 5: Save results to Firestore
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
      "extractProgress.Amounts Extracted": "success",
    });

    console.log(`✅ Total Lines Processed: ${totalAmountsLinesProcessed}`);
    console.log("🎉 Amount Extraction Completed!");
  
  } catch (error) {
    console.error("🔥 Error Dates Extracted:", error);
    await updateDoc(doc(db, "clients", clientId), {
      "extractProgress.Amounts Extracted": "failed",
    });
  }
};

export default extractAmounts;
