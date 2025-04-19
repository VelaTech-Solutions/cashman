import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

const removeNotTransactions = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(`🔄 Dates Extracted for Client: ${id} | Bank: ${bankName}`);

    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.Dates Extracted": "processing",
    });

    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, { "extractProgress.Dates Extracted": "failed" });
      return;
    }

    let { filteredData = [], transactions = [], archive = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping date extraction.");
      await updateDoc(clientRef, { "extractProgress.Dates Extracted": "failed" });
      return;
    }

    const isInvalidDate = (date) => {
      return !date || date === "None" || date === "null" || date === "";
    };

    const isInvalidTransaction = (tx) =>
      isInvalidDate(tx.date1) && isInvalidDate(tx.date2);

    const validTransactions = transactions.filter(tx => !isInvalidTransaction(tx));
    const invalidTransactions = transactions.filter(isInvalidTransaction);

    // Append invalid transactions to archive
    const updatedArchive = [...(archive || []), ...invalidTransactions];

    // Update Firestore with only valid transactions + updated archive
    await updateDoc(clientRef, {
      transactions: validTransactions,
      archive: updatedArchive,
      "extractProgress.Dates Extracted": "done",
    });

    console.log(`✅ Removed ${invalidTransactions.length} invalid transactions`);

  } catch (error) {
    console.error("❌ Error removing not transactions:", error);
  }
};

export default removeNotTransactions;
