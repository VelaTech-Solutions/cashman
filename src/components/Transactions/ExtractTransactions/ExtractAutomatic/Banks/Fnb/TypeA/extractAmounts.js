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
    
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    let { filteredData = [] } = clientSnap.data();
    // ALWAYS start fresh transactions array
    let updatedTransactions = [];

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping Amount extraction.");
      return;
    }

    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

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

    const extractAmountsFromText = (text) => {
      const matches = [];
      try {
        const regex = new RegExp(amountRegex, "g");
        const found = text.match(regex);
        console.log(found);
        if (found) matches.push(...found);
      } catch (e) {
        console.warn(`❌ Invalid regex:`, e.message);
      }
      return matches;
    };

    const updatedFilteredData = [...filteredData];

    filteredData.forEach((line, index) => {
      if (!line) {
        updatedTransactions[index] = {
          credit_debit_amount: null,
          balance_amount: null,
          fees_amount: null,
        };
        return;
      }

      line = line.replace(/,/g, "");

      const extracted = extractAmountsFromText(line);

      if (extracted.length !== 2 && extracted.length !== 3) {
        updatedTransactions[index] = {
          credit_debit_amount: null,
          balance_amount: null,
          fees_amount: null,
        };
        return;
      }

      let credit_debit_amount = extracted[0];
      let balance_amount = extracted[1];
      let fees_amount = extracted.length === 3 ? extracted[2] : "0.00";

      // const credit_debit_amountStripped = credit_debit_amount?.replace(/[a-zA-Z\s]/g, "") || null;
      // const balance_amountStripped = balance_amount?.replace(/[a-zA-Z\s]/g, "") || null;
      // const fees_amountStripped = fees_amount?.replace(/[a-zA-Z\s]/g, "") || null;

      const strippedLine = extracted.reduce(
        (acc, amount) => acc.replace(amount, "").trim(),
        line
      );

      updatedFilteredData[index] = strippedLine || line;

      updatedTransactions[index] = {
        credit_debit_amount: credit_debit_amount,
        balance_amount: balance_amount,
        fees_amount: fees_amount,
      };
    });

    // Firestore-safe: make sure array is never sparse & never has undefined
    updatedTransactions = updatedTransactions.map((txn) => {
      if (!txn) {
        return {
          credit_debit_amount: null,
          balance_amount: null,
          fees_amount: null,
        };
      }
      return txn;
    });

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

// the regex im using im settings
// (\s\d*?\,?\d*\.\d{2}\w{2}?)

// 23
// "schedule trf to invest r500.00-9868-savings savings account 500.00 22,957.99cr"
// (string)
// its finding this 500.00 and i dont want

// 24
// "scheduled trf to r1,000.00-9126-money money on call 1,000.00 21,957.99cr"
// (string)
// its finding this 1,000.00 and i dont want