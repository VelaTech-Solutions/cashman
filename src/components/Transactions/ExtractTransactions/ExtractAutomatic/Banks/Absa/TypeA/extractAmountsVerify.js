// extractAmountsVerify.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

import ProgressUtils from "../../../Utils/ProgressUtils";

const extractAmountsVerify = async (clientId, bankName, type) => {
  if (!clientId || !bankName || !type) {
    console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }

  try {
    console.log(`🔄 Verifying transactions for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Verify Amounts", "processing");
    
    // Step 1: Get client data
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    let { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      console.warn("⚠️ No transactions found, skipping verification.");
      await ProgressUtils.updateProgress(clientId, "Verify Amounts", "failed");
      return;
    }

    // Normalize type (e.g., "TypeA" → "typeA")
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

    let correctedTransactions = [];

    transactions.forEach((tx, index) => {
      try {
        const amount = parseFloat(tx.credit_debit_amount) || 0;

        let credit = 0;
        let debit = 0;

        if (amount < 0) {
          debit = Math.abs(amount);
        } else {
          credit = amount;
        }

        // You can later verify balance changes here (next step)

        correctedTransactions.push({
          ...tx,
          credit_amount: credit.toFixed(2),
          debit_amount: debit.toFixed(2),
          // verified: "pending", // for example, you can add verification later
        });
      } catch (error) {
        console.error(`Error processing transaction ${index + 1}`, error);
      }
    });

    // Step ✅: Save results to Firestore
    await updateDoc(clientRef, {
      transactions: correctedTransactions,
    });

    await ProgressUtils.updateProgress(clientId, "Verify Amounts", "success");
    console.log("🎉 Amounts verified successfully.");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Verify Amounts", "failed");
    console.error("🔥 Error Amounts verifying:", error);
  }
};

export default extractAmountsVerify;