// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractAmounts.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../firebase/firebase";
import BankAmountsRules from "../../../../../Rules/bankAmountsRules"; // ✅ Ensure correct import

const extractAmounts = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(`🔄 Amounts Extracted for Client: ${id} | Bank: ${bankName}`);

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.Amounts Extracted": "processing",
    });

    // Step 2: Fetch client data
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, {
        "extractProgress.Amounts Extracted": "failed",
      });
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping amount extraction.");
      await updateDoc(clientRef, {
        "extractProgress.Amounts Extracted": "failed",
      });
      return;
    }
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

    // Log total lines processed
    console.log(`✅ Total Lines Processed: ${totalLinesProcessed}`);
    console.log("✅ Amounts Extracted:");



    // Step 4: Update Firestore with both the updated transactions AND the stripped filteredData
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData, // Store stripped lines
      "extractProgress.Amounts Extracted": "success",
    });

    console.log("🎉 Amount Extraction Completed!");
  } catch (error) {
    console.error("🔥 Error Amounts Extracted:", error);
    await updateDoc(clientRef, {
      "extractProgress.Amounts Extracted": "failed",
    });
  }
};

export default extractAmounts;
