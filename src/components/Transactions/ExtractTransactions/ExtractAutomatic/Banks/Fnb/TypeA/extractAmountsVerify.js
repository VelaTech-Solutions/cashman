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
    let totalCredits = 0;
    let totalDebits = 0;

// to help check and verify the amounts i have left the cr in the amount
// so in credit_debit_amount if a amount has the \w{2} its a credit if not its a debit once checked remove the \w{2}
// in the balance amount if it cr the w\{2} that means its a normal balance amount but if it has no \w{2} that means its in the negitivae so u need to please a - infornt the amount


    transactions.forEach((tx, index) => {
      try {
        let cdRaw = tx.credit_debit_amount || "";
        let balanceRaw = tx.balance_amount || "";

        let credit = 0;
        let debit = 0;

        // --- Process credit_debit_amount ---
        const cdMatch = cdRaw.match(/([\d,.]+\.\d{2})(\w{2})?$/);
        let cdAmount = 0;
        if (cdMatch) {
          cdAmount = parseFloat(cdMatch[1].replace(/,/g, "")) || 0;
          const suffix = cdMatch[2] ? cdMatch[2].toLowerCase() : "";

          if (suffix) {
            // Treat any suffix as credit
            credit = cdAmount;
            totalCredits++;
          } else {
            // No suffix means debit
            debit = cdAmount;
            totalDebits++;
          }
        }

        // --- Process balance_amount ---
        const balanceMatch = balanceRaw.match(/([\d,.]+\.\d{2})(\w{2})?$/);
        let balanceAmount = 0;
        if (balanceMatch) {
          balanceAmount = parseFloat(balanceMatch[1].replace(/,/g, "")) || 0;
          const suffix = balanceMatch[2] ? balanceMatch[2].toLowerCase() : "";

          if (!suffix) {
            // No suffix means it's negative
            balanceAmount = balanceAmount * -1;
          }
        }

        correctedTransactions.push({
          ...tx,
          credit_debit_amount: cdAmount.toFixed(2),
          credit_amount: credit.toFixed(2),
          debit_amount: debit.toFixed(2),
          balance_amount: balanceAmount.toFixed(2)
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
