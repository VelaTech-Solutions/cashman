// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractAmountsVerify2.js

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";


const extractAmountsVerify2 = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    console.log(`🔄 Verifying transactions...`);

    // Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.Amounts Verifed Step 2": "processing",
    });

    // Fetch client data
    let clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, {
        "extractProgress.Amounts Verifed Step 2": "failed",
      });
      return;
    }

    let { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      console.warn("⚠️ No transactions found, skipping verification.");
      await updateDoc(clientRef, {
        "extractProgress.Amounts Verifed Step 2": "failed",
      });
      return;
    }

    let correctedTransactions = [];
    let previousBalance = null; // Store previous transaction balance

    transactions.forEach((tx, index) => {
      try {
        let currBalance = parseFloat(tx.balance_amount) || 0;
        let credit = parseFloat(tx.credit_amount) || 0;
        let debit = parseFloat(tx.debit_amount) || 0;
        let verified = "✗"; // Default to unverified

        // Only verify if there is a previous balance to compare
        if (previousBalance !== null) {
          let expectedBalance = previousBalance + credit - debit;

          if (Math.abs(expectedBalance - currBalance) > 0.01) {
            // console.warn(
            //   `⚠️ Balance mismatch at index ${index + 1}: Expected ${expectedBalance}, Found ${currBalance}`
            // );

            // Auto-fix the incorrect credit or debit
            let difference = currBalance - previousBalance;

            if (difference > 0) {
              credit = difference;
              debit = 0;
            } else {
              debit = Math.abs(difference);
              credit = 0;
            }
          } else {
            verified = "✓"; // Mark transaction as verified
          }
        }

        // Update previous balance for next iteration
        previousBalance = currBalance;

        correctedTransactions.push({
          ...tx,
          credit_amount: credit.toFixed(2),
          debit_amount: debit.toFixed(2),
          verified,
        });

      } catch (error) {
        console.error(`❌ Error processing transaction ${index + 1}, skipping...`, error);
      }
    });

    // Update Firestore
    await updateDoc(clientRef, {
      transactions: correctedTransactions,
      number_of_transactions: correctedTransactions.length,
      "extractProgress.Amounts Verifed Step 2": "success",
    });

    console.log("✅ Transactions verified successfully.");
  } catch (error) {
    console.error("🔥 Error verifying transactions:", error);
    try {
      await updateDoc(clientRef, {
        "extractProgress.Amounts Verifed Step 2": "failed",
      });
    } catch (updateError) {
      console.error("❌ Failed to update Firestore after error:", updateError);
    }
  }
};

export default extractAmountsVerify2;
