import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

import { parse, format, isValid } from "date-fns";

import ProgressUtils from "../../../Utils/ProgressUtils";

const extractDatesVerify = async (clientId, bankName) => {
  if (!clientId || !bankName) return console.error("❌ Missing Client ID or Bank Name");

  const clientRef = doc(db, "clients", clientId);

  try {
    console.log(`🔍 Verifying Dates for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Verify Dates", "processing");

    const [clientSnap] = await Promise.all([
      getDoc(clientRef),
    ]);

    if (!clientSnap.exists()) throw new Error("Client not found.");

    let { transactions = [] } = clientSnap.data();
    if (!transactions.length) throw new Error("No transactions to verify.");

    const updatedTransactions = [...transactions];
    let totalDateLinesProcessed = 0;

    const normalizeDate = (inputDate) => {
      try {
        // Try parsing with ISO format first
        let parsed = parse(inputDate, "yyyy-MM-dd", new Date());
        if (isValid(parsed)) return format(parsed, "dd/MM/yyyy");

        // Then try parsing with common dd/MM/yyyy format
        parsed = parse(inputDate, "dd/MM/yyyy", new Date());
        if (isValid(parsed)) return format(parsed, "dd/MM/yyyy");
      } catch {
        return inputDate;
      }
      return inputDate;
    };

    // Step 1: Only process the transactions with extracted date fields
    updatedTransactions.forEach((transaction, index) => {
      if (!transaction || !transaction.date1) return;

      // Step 2: Validate and normalize `date1` and `date2`
      const date1 = normalizeDate(transaction.date1);
      const date2 = transaction.date2 ? normalizeDate(transaction.date2) : "None";

      // Step 3: Update the transaction with validated/normalized dates
      updatedTransactions[index] = {
        ...transaction,
        date1,
        date2,
      };

      if (date1 !== transaction.date1 || date2 !== transaction.date2) {
        totalDateLinesProcessed++; // Count as processed if we amended anything
      }
    });

    // Step 4: Update Firestore with the updated transactions
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
    });
    
    await ProgressUtils.updateProgress(clientId, "Verify Dates", "success");
    console.log("🎉 Date verification complete!");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Verify Dates", "failed");
    console.error("🔥 Error verifying dates:", error);
  }
};

export default extractDatesVerify;
