import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const createDatabaseStructure = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    console.log(`🔄 Initializing Firestore structure for Client: ${id}`);

    const clientRef = doc(db, "clients", id);
    const clientSnap = await getDoc(clientRef);

    const defaultTransaction = {
      date1: null,
      date2: null,
      original: "",
      fees_amount: "0.00",
      fees_type: null,
      description: "",
      debit_amount: "0.00",
      credit_amount: "0.00",
      credit_debit_amount: "0.00",
      balance_amount: "0.00",
      cleaned: false,
    };

    if (!clientSnap.exists()) {
      console.warn("⚠️ No existing client data, creating a new structure...");
      await setDoc(clientRef, {
        transactions: [defaultTransaction], // Ensure at least one transaction exists
        cleanedData: [],
        processedReports: [],
        extractProgress: {
          extractDatesProgress: "pending",
          extractAmountsProgress: "pending",
          cleanStatementProgress: "pending",
        },
      });
      console.log("✅ Firestore structure initialized!");
    } else {
      console.log("✔️ Client already exists, checking for missing fields...");

      // ✅ Ensure every transaction has all required fields
      const existingData = clientSnap.data();
      const updatedTransactions = existingData.transactions
        ? existingData.transactions.map((txn) => ({
            ...defaultTransaction, // ✅ Apply all required fields
            ...txn, // ✅ Keep existing data
          }))
        : [defaultTransaction]; // ✅ Ensure at least one transaction exists

      const updatedData = {
        transactions: updatedTransactions,
        cleanedData: existingData.cleanedData ?? [],
        processedReports: existingData.processedReports ?? [],
        extractProgress: {
          extractDatesProgress: existingData.extractProgress?.extractDatesProgress ?? "pending",
          extractAmountsProgress: existingData.extractProgress?.extractAmountsProgress ?? "pending",
          cleanStatementProgress: existingData.extractProgress?.cleanStatementProgress ?? "pending",
        },
      };

      // ✅ Merge missing fields
      await updateDoc(clientRef, updatedData);
      console.log("✅ Missing fields added successfully to all transactions!");
    }
  } catch (error) {
    console.error("🔥 Error initializing Firestore:", error);
  }
};

export default createDatabaseStructure;
