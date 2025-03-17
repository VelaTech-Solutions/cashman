import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const VerifyTransactions = async (clientId) => {
  if (!clientId) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    console.log(`🔄 Verifying transactions for Client: ${clientId}`);

    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    let { transactions = [], startingBalance } = clientSnap.data();
    startingBalance = parseFloat(startingBalance) || (transactions.length > 0 ? parseFloat(transactions[0].balance_amount) || 0 : 0);
    
    let runningBalance = startingBalance;
    const updatedTransactions = transactions.map((tx, index) => {
      const fees = parseFloat(tx.fees_amount) || 0;
      const cd = parseFloat(tx.credit_debit_amount) || 0;

      let credit = cd > 0 ? cd : 0;
      let debit = cd < 0 ? Math.abs(cd) : 0;

      // If previous balance exists, use it as a reference for correction
      if (index > 0) {
        const prevBalance = parseFloat(updatedTransactions[index - 1]?.balance_amount) || runningBalance;
        if (prevBalance < runningBalance) {
          debit = cd; 
          credit = 0;
        } else {
          credit = cd;
          debit = 0;
        }
      }

      // Adjust running balance
      runningBalance += credit - debit - fees;
      const newBalance = runningBalance.toFixed(2);

      return {
        ...tx,
        fees_amount: fees.toFixed(2),
        credit_debit_amount: cd.toFixed(2),
        credit_amount: credit.toFixed(2),
        debit_amount: debit.toFixed(2),
        balance_amount: newBalance,
      };
    });

    await updateDoc(clientRef, { transactions: updatedTransactions });
    console.log("✅ Transactions verified and updated:", updatedTransactions);
  } catch (error) {
    console.error("🔥 Error verifying transactions:", error);
  }
};

export default VerifyTransactions;
