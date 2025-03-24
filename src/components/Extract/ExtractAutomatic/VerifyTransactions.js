import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const VerifyTransactions = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    console.log(`🔄 Verifying transactions...`);

    // Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.extractVerifyProgress": "processing",
    });

    // Fetch client data
    let clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, {
        "extractProgress.extractVerifyProgress": "failed",
      });
      return;
    }

    let { transactions = [] } = clientSnap.data();
    if (transactions.length === 0) {
      console.warn("⚠️ No transactions found, skipping verification.");
      await updateDoc(clientRef, {
        "extractProgress.extractVerifyProgress": "failed",
      });
      return;
    }

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
        let verified = "✗"; // Default to unverified

        // Compare balances to determine debit or credit
        if (currBalance > prevBalance) {
          credit = Math.abs(cd);
          totalCredits++;
          verified = "✓";
        } else if (currBalance < prevBalance) {
          debit = Math.abs(cd);
          totalDebits++;
          verified = "✓";
        }

        correctedTransactions.push({
          ...tx,
          fees_amount: fees.toFixed(2),
          credit_debit_amount: cd.toFixed(2),
          credit_amount: credit.toFixed(2),
          debit_amount: debit.toFixed(2),
          verified,
        });

      } catch (error) {
        console.error(`❌ Error processing transaction ${index + 1}, skipping...`, error);
      }
    });

    // Log total counts for debugging
    console.log(`📊 Total Credits: ${totalCredits}, Total Debits: ${totalDebits}`);

    // Update Firestore
    await updateDoc(clientRef, {
      transactions: correctedTransactions,
      number_of_transactions: correctedTransactions.length,
      "extractProgress.extractVerifyProgress": "success",
    });

    console.log("✅ Transactions verified successfully.");
  } catch (error) {
    console.error("🔥 Error verifying transactions:", error);
    try {
      await updateDoc(clientRef, {
        "extractProgress.extractVerifyProgress": "failed",
      });
    } catch (updateError) {
      console.error("❌ Failed to update Firestore after error:", updateError);
    }
  }
};

export default VerifyTransactions;
