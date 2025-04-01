
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
    debit_amount: 0.0,
    credit_amount: 0.0,
    credit_debit_amount: 0.0,
    balance_amount: 0.0,
    number_of_transactions: 0,
    verified: "",
    cleaned: false,
  };

  try {
    await ProgressUtils.updateProgress(id, "Creating database structure", "processing");

    if (!clientSnap.exists()) {
      await setDoc(clientRef, {
        transactions: [defaultTransaction],
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
        extractProgress: {},
      });
    } else {
      const data = clientSnap.data();
      const updatedTransactions = data.transactions
        ? data.transactions.map((txn) => ({ ...defaultTransaction, ...txn }))
        : [defaultTransaction];

      await updateDoc(clientRef, {
        transactions: updatedTransactions,
        budgetData: {
          income: data.budgetData?.income ?? 0,
          incomeavg: data.budgetData?.incomeavg ?? 0,
          expenses: data.budgetData?.expenses ?? 0,
          expensesavg: data.budgetData?.expensesavg ?? 0,
          savings: data.budgetData?.savings ?? 0,
          savingsavg: data.budgetData?.savingsavg ?? 0,
          housing: data.budgetData?.housing ?? 0,
          housingavg: data.budgetData?.housingavg ?? 0,
          transport: data.budgetData?.transport ?? 0,
          transportavg: data.budgetData?.transportavg ?? 0,
          debt: data.budgetData?.debt ?? 0,
          debtavg: data.budgetData?.debtavg ?? 0,
          timestamp: data.budgetData?.timestamp ?? new Date().toISOString(),
        },
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
