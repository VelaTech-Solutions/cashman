
// Firebase Imports
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from './ProgressUtils';

const createDatabaseStructure = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  const clientRef = doc(db, "clients", id);
  const clientSnap = await getDoc(clientRef);

  const defaultTransaction = {
    date1: null,
    date2: null,
    original: "",
    fees_amount: 0.0,
    fees_type: null,
    description: "",
    description2: "", // this is not being created why?
    debit_amount: 0.0,
    credit_amount: 0.0,
    credit_debit_amount: 0.0,
    balance_amount: 0.0,
    number_of_transactions: 0,
    verified: "",
    cleaned: false,
  };

  const defaultBudgetData = {
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
  };

  try {
    await ProgressUtils.updateProgress(id, "Creating database structure", "processing");

    if (!clientSnap.exists()) {
      await setDoc(clientRef, {
        transactions: [defaultTransaction],
        budgetData: defaultBudgetData,
        archive: [], 
        processedReports: [],
        extractProgress: {},
      });
    } else {
      
      const data = clientSnap.data();

      const updatedTransactions = data.transactions
        ? data.transactions.map((txn) => ({
          ...txn, 
          ...defaultTransaction 
          }))
        : [defaultTransaction];
    
      const updatedBudgetData = data.budgetData ?? defaultBudgetData;

      await updateDoc(clientRef, {
        transactions: updatedTransactions,
        budgetData: updatedBudgetData,
        archive: data.archive ?? [],       // Array for archived/deleted lines
        processedReports: data.processedReports ?? [],
        extractProgress: data.extractProgress ?? {},
      });
    }

    await ProgressUtils.updateProgress(id, "Creating database structure", "success");
  } catch (error) {
    await ProgressUtils.updateProgress(id, "Creating database structure", "failed");
    console.error("🔥 Error initializing Firestore:", error);
  }
};

export default createDatabaseStructure;
