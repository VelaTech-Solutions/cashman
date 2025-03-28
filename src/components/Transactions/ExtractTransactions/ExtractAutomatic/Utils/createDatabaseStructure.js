import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

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
      fees_amount: 0.00, // ✅ Ensure it's a number, not a string
      fees_type: null,
      description: "",
      debit_amount: 0.00, // ✅ Ensure all amounts are numbers
      credit_amount: 0.00,
      credit_debit_amount: 0.00,
      balance_amount: 0.00,
      number_of_transactions: 0, // ✅ Should be a number, not a string
      verified: "",
      cleaned: false,
    };

    if (!clientSnap.exists()) {
      console.warn("⚠️ No existing client data, creating a new structure...");
      await setDoc(clientRef, {
        transactions: [defaultTransaction], // ✅ Ensure at least one transaction exists
        cleanedData: [],
        budgetData: {
          income: 0,
          incomeavg: 0,
          expenses: 0,
          expensesavg: 0,
          savings: 0,
          savingsavg: 0,
          housing: 0,
          housingavg: 0,
          transport: 0,
          transportavg: 0,
          debt: 0,
          debtavg: 0,
          timestamp: new Date().toISOString(),
        },
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

      const existingData = clientSnap.data();

      // ✅ Ensure every transaction has all required fields
      const updatedTransactions = existingData.transactions
        ? existingData.transactions.map((txn) => ({
            ...defaultTransaction, // ✅ Apply all required fields
            ...txn, // ✅ Keep existing data
          }))
        : [defaultTransaction];

      const updatedData = {
        transactions: updatedTransactions,
        cleanedData: existingData.cleanedData ?? [],
        budgetData: {
          income: existingData.budgetData?.income ?? 0,
          incomeavg: existingData.budgetData?.incomeavg ?? 0,
          expenses: existingData.budgetData?.expenses ?? 0,
          expensesavg: existingData.budgetData?.expensesavg ?? 0,
          savings: existingData.budgetData?.savings ?? 0,
          savingsavg: existingData.budgetData?.savingsavg ?? 0,
          housing: existingData.budgetData?.housing ?? 0,
          housingavg: existingData.budgetData?.housingavg ?? 0,
          transport: existingData.budgetData?.transport ?? 0,
          transportavg: existingData.budgetData?.transportavg ?? 0,
          debt: existingData.budgetData?.debt ?? 0,
          debtavg: existingData.budgetData?.debtavg ?? 0,
          timestamp: existingData.budgetData?.timestamp ?? new Date().toISOString(),
        },
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
