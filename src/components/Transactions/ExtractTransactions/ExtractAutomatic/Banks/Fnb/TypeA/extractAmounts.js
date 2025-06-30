// extractAmounts.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

import ProgressUtils from "../../../Utils/ProgressUtils";

const extractAmounts = async (clientId, bankName, type) => {
  if (!clientId || !bankName || !type) {
    console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }

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
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

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
        console.log(found)
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

    // Step 4: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];
    let totalAmountsLinesProcessed = 0;

filteredData.forEach((line, index) => {
  if (!line) return;

  // quick filter remove the , in each line then run normal
  line = line.replace(/,/g, "");
  
  const extracted = extractAmountsFromText(line);

  if (extracted.length !== 2 && extracted.length !== 3) {
    // Only process lines with exactly 2 or 3 amounts
    return;
  }

  totalAmountsLinesProcessed++;

  let credit_debit_amount = "0.00";
  let balance_amount = "0.00";
  let fees_amount = "0.00";

  if (extracted.length === 2) {
    // [credit/debit, balance]
    credit_debit_amount = extracted[0];
    balance_amount = extracted[1];
  } else if (extracted.length === 3) {
    // [credit/debit, balance, fees]
    credit_debit_amount = extracted[0];
    balance_amount = extracted[1];
    fees_amount = extracted[2];
  }

  // Strip letters and spaces
  const credit_debit_amountStripped = credit_debit_amount.replace(/[a-zA-Z\s]/g, "");
  const balance_amountStripped = balance_amount.replace(/[a-zA-Z\s]/g, "");
  const fees_amountStripped = fees_amount.replace(/[a-zA-Z\s]/g, "");

  // Remove all matched amounts from the original line
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
    fees_amount: fees_amountStripped,
  };
});


    // Step ✅: Save results to Firestore
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
    });

    await ProgressUtils.updateProgress(clientId, "Amounts Extracted", "success");
    console.log("🎉 Amount Extraction Completed!");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Amounts Extracted", "failed");
    console.error("🔥 Error Amounts Extracted:", error);
  }
};

export default extractAmounts;
