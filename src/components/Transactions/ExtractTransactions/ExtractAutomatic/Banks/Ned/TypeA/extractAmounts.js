// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const extractAmounts = async (clientId, bankName, type) => {
  if (!clientId || !bankName || !type) {
    console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }

  try {
    console.log(`🔄 Starting Amount Extraction | Client: ${clientId} | Bank: ${bankName} | Type: ${type}`);
    await ProgressUtils.updateProgress(clientId, "Amounts Extracted", "processing");

    // Step 1: Fetch client data
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (!filteredData.length) {
      console.warn("⚠️ No filtered data available. Skipping amount extraction.");
      return;
    }

    // Normalize type casing
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

    // Step 2: Fetch config
    const configRef = doc(db, "settings", "bankOptions", bankName, "config");
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      console.warn(`⚠️ Config not found for bank: ${bankName}`);
      return;
    }

    const configData = configSnap.data();
    const amountRegex = configData?.[typeKey]?.amountRegex;

    if (!amountRegex) {
      console.warn(`⚠️ No amountRegex for "${typeKey}" in bank "${bankName}"`);
      return;
    }

    // Step 3: Amount extractor
    const extractAmountsFromText = (text) => {
      const matches = [];
      try {
        const regex = new RegExp(amountRegex, "g");
        const found = text.match(regex);
        if (found) matches.push(...found);
      } catch (e) {
        console.warn(`❌ Invalid regex:`, e.message);
      }
      return matches;
    };

    let totalAmountsLinesProcessed = 0;
    const updatedFilteredData = [];
    const updatedTransactions = [...transactions];

    filteredData.forEach((line, index) => {
      const extracted = extractAmountsFromText(line);
      if (extracted.length === 0) {
        updatedFilteredData.push(line);
        return;
      }

      totalAmountsLinesProcessed++;

      let fees = "0.00";
      let credit = "0.00";
      let balance = "0.00";

      if (extracted.length === 1) {
        balance = extracted[0]; // Treat single amount as opening balance
      } else if (extracted.length === 2) {
        [credit, balance] = extracted;
      } else if (extracted.length >= 3) {
        [fees, credit, balance] = extracted;
      }

      // Clean values
      const clean = (val) => val.replace(/[a-zA-Z\s,]/g, "");

      // Remove extracted values from the line
      const cleanedLine = extracted.reduce((txt, amt) => txt.replace(amt, "").trim(), line);

      updatedFilteredData.push(cleanedLine);

      updatedTransactions[index] = {
        ...(updatedTransactions[index] || {}),
        fees_amount: clean(fees),
        credit_debit_amount: clean(credit),
        balance_amount: clean(balance),
      };
    });

    // Step 5: Save results
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
      "extractProgress.Amounts Extracted": "success",
    });

    console.log(`✅ Amount Extraction Completed: ${totalAmountsLinesProcessed} lines processed.`);

  } catch (error) {
    console.error("🔥 Error during Amounts Extraction:", error);
    await updateDoc(doc(db, "clients", clientId), {
      "extractProgress.Amounts Extracted": "failed",
    });
  }
};

export default extractAmounts;
