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

    // 
    let { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      console.warn("⚠️ No transactions found, skipping verification.");
      await ProgressUtils.updateProgress(clientId, "Verify Amounts", "failed");
      return;
    }

    // Normalize type (e.g., "TypeA" → "typeA")
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);

    let correctedTransactions = [];
    let totalCredits = 0;
    let totalDebits = 0;

    transactions.forEach((tx, index) => {
      try {
        let fees = parseFloat(tx.fees_amount) || 0;
        let cd = parseFloat(tx.credit_debit_amount) || 0;
        let prevBalance = index > 0 ? parseFloat(transactions[index - 1].balance_amount) : 0;
        let currBalance = parseFloat(tx.balance_amount) || 0;

        let credit = 0;
        let debit = 0;

        // Compare balances to determine debit or credit
        if (currBalance > prevBalance) {
          credit = Math.abs(cd);
          totalCredits++;
        } else if (currBalance < prevBalance) {
          debit = Math.abs(cd);
          totalDebits++;
        }

        correctedTransactions.push({
          ...tx,
          fees_amount: fees.toFixed(2),
          credit_debit_amount: cd.toFixed(2),
          credit_amount: credit.toFixed(2),
          debit_amount: debit.toFixed(2),
        });

      } catch (error) {
        console.error(`Error processing transaction ${index + 1}`, error);
      }
    });

    // Step : Save results to Firestore
    await updateDoc(clientRef, {
      transactions: correctedTransactions,
    });

    await ProgressUtils.updateProgress(clientId, "Verify Amounts", "success");
    console.log("🎉 Amounts verified successfully.");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Verify Amounts", "failed");
    console.error("🔥 Error amount verifying:", error);
  }
};


export default extractAmountsVerify;
