import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { parse, format } from "date-fns";

const extractDatesVerify = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  const clientRef = doc(db, "clients", id);
  const bankRef = doc(db, "settings", "dates", bankName, "config");

  try {
    console.log(`🔍 Verifying Dates for Client: ${id} | Bank: ${bankName}`);
    await updateDoc(clientRef, {
      "extractProgress.Verifying Extracted Dates": "processing",
    });

    const [clientSnap, bankSnap] = await Promise.all([
      getDoc(clientRef),
      getDoc(bankRef),
    ]);

    if (!clientSnap.exists()) throw new Error("Client not found.");
    if (!bankSnap.exists()) throw new Error("Bank rules not found.");

    const dateRules = bankSnap.data();

    let { filteredData = [], transactions = [] } = clientSnap.data();
    if (!transactions.length) throw new Error("No transactions to verify.");

    const updatedTransactions = [...transactions];
    let totalDateLinesProcessed = 0;

    const normalizeDate = (dateStr) => {
      const formatsToTry = [
        "yyyy-MM-dd",
        "dd-MM-yyyy",
        "dd/MM/yyyy",
        "MM/dd/yyyy",
        "yyyy/MM/dd",
      ];

      for (const fmt of formatsToTry) {
        try {
          const parsed = parse(dateStr, fmt, new Date());
          if (!isNaN(parsed)) {
            return format(parsed, "yyyy-MM-dd");
          }
        } catch (_) {}
      }

      return dateStr; // fallback if parsing fails
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

    console.log(`✅ Total verified and updated date lines: ${totalDateLinesProcessed}`);

    // Step 4: Update Firestore with the updated transactions
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      "extractProgress.Verifying Extracted Dates": "success",
    });

    console.log("🎉 Date verification and normalization complete!");
  } catch (error) {
    console.error("🔥 Error verifying dates:", error);
    await updateDoc(clientRef, {
      "extractProgress.Verifying Extracted Dates": "failed",
    });
  }
};

export default extractDatesVerify;
