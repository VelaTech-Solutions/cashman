// extractAmounts.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";
import BankAmountsRules from "../../../../../../Rules/bankAmountsRules"; // ✅ Ensure correct import

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

    const stripAmountsFromLine = (line, amounts) => {
      let strippedLine = line;
      
      amounts.forEach((rawAmount) => {
        if (!rawAmount || rawAmount === "0.00") return;
    
        // Build possible variants to remove
        const clean = rawAmount.replace(/[^\d.-]/g, "");
        const variations = [
          clean,
          parseFloat(clean).toFixed(2),
          `-${Math.abs(clean)}`,
          `R ${clean}`,
          `R${clean}`,
          clean.replace("-", ""),
        ];
    
        variations.forEach((variant) => {
          const regex = new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
          strippedLine = strippedLine.replace(regex, "").trim();
        });
      });
    
      return strippedLine;
    };
    

    // Initialize a counter for processed lines
    let totalLinesProcessed = 0;

    // Step 3: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];

    filteredData.forEach((line, index) => {
        if (!line) return;

        const extractedAmounts =
            BankAmountsRules[bankName](line) || ["0.00", "0.00", "0.00"];

        const [fees_amount, credit_debit_amount, balance_amount] =
            extractedAmounts.map((amount) => amount || "0.00");

        totalLinesProcessed++;

        const strippedLine = stripAmountsFromLine(line, extractedAmounts);

        updatedFilteredData[index] = strippedLine;

        if (!updatedTransactions[index]) {
            updatedTransactions[index] = {};
        }

        updatedTransactions[index] = {
            ...updatedTransactions[index],
            fees_amount,
            credit_debit_amount,
            balance_amount,
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
