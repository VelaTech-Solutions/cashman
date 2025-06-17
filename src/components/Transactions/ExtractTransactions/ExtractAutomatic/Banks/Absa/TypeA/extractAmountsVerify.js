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
    console.log(`🔄 Verifying transactions...`);
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
      await updateDoc(clientRef, {
        "extractProgress.Amounts Verifed Step 1": "failed",
      });
      return;
    }

    // Normalize type (e.g., "TypeA" → "typeA")
    console.log("typebefore", type)
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1);
    console.log("typeKey",typeKey);
    
    let correctedTransactions = [];
    let totalCredits = 0;
    let totalDebits = 0;

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




    // Step : Save results to Firestore
    await updateDoc(clientRef, {
      transactions: correctedTransactions,
      "extractProgress.Verify Amounts": "success",
    });

    console.log(`✅ Total Credits: ${totalCredits}, Total Debits: ${totalDebits}`);
    console.log("🎉 Transactions verified successfully.");

  } catch (error) {
    console.error("🔥 Error Dates Extracted:", error);
    await updateDoc(doc(db, "clients", clientId), {
      "extractProgress.Verify Amounts": "failed",
    });
  }
};

export default extractAmountsVerify;



    // let { transactions = [] } = clientSnap.data();
    // if (transactions.length === 0) {
    //   console.warn("⚠️ No transactions found, skipping verification.");
    //   await updateDoc(clientRef, {
    //     "extractProgress.Amounts Verifed Step 1": "failed",
    //   });
    //   return;
    // }

    // // Normalize type (e.g., "TypeA" → "typeA")
    // console.log("typebefore", type)
    // const typeKey = type.charAt(0).toLowerCase() + type.slice(1);
    // console.log("typeKey",typeKey);
    
    // let correctedTransactions = [];
    // let totalCredits = 0;
    // let totalDebits = 0;

    // transactions.forEach((tx, index) => {
    //   try {
    //     let cd = parseFloat(tx.credit_debit_amount) || 0;
    //     let prevBalance = index > 0 ? parseFloat(transactions[index - 1].balance_amount) : 0;
    //     let currBalance = parseFloat(tx.balance_amount) || 0;

    //     let credit = 0;
    //     let debit = 0;
    //     let verified = "✗"; // Default to unverified

    //     // Compare balances to determine debit or credit
    //     if (currBalance > prevBalance) {
    //       credit = Math.abs(cd);
    //       totalCredits++;
    //       verified = "✓";
    //     } else if (currBalance < prevBalance) {
    //       debit = Math.abs(cd);
    //       totalDebits++;
    //       verified = "✓";
    //     }

    //     correctedTransactions.push({
    //       ...tx,
    //       credit_debit_amount: cd.toFixed(2),
    //       credit_amount: credit.toFixed(2),
    //       debit_amount: debit.toFixed(2),
    //       verified,
    //     });

    //   } catch (error) {
    //     console.error(`❌ Error processing transaction ${index + 1}, skipping...`, error);
    //   }
    // });
