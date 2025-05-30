
// Firebase Imports
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// UUID Imports
import { v4 as uuidv4 } from "uuid";

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
    uid: uuidv4(),   // 🔐 Add UID
    date1: null,
    date2: null,
    original: "",
    category: "",
    subcategory: "",
    verified: "",
    description: "",
    description2: "",
    cleaned: false,
    fees_type: null,
    fees_amount: 0.0,
    debit_amount: 0.0,
    credit_amount: 0.0,
    credit_debit_amount: 0.0,
    balance_amount: 0.0,
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
        archive: data.archive ?? [],
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
