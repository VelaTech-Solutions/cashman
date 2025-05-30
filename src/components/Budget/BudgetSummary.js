// src/components/Budget/BudgetSummary.js
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

// Firebase imports
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

// Component Imports
import LoadClientData from "components/Common/LoadClientData";
import { TemplateContext } from "components/Common/TemplateContext"; 
import { generateBudgetReport } from "components/Budget/Utils/xlsxModule"; 

import SummaryActions from "./Actions/SummaryActions";
import SummaryView from "./Views/SummaryView";

// import BudgetSummaryView4 from "./BudgetSummaryView/Views/BudgetSummaryView4";

const BudgetSummary = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [notes, setNotes] = useState([]); 
  const [note, setNote] = useState(""); 
  const [viewMode, setViewMode] = useState(1);
  const db = getFirestore();
  const { templateBlob } = useContext(TemplateContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(clientId);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [clientId]);

  if (!clientData) return <div className="text-white">Loading client data...</div>;

// Ensure clientData.transactions exists
const transactions = clientData?.transactions || [];

// Define categories and their respective filters
const categories = [
  { name: "Income", filter: (t) => t.category === "Income", key: "credit_amount" },
  { name: "Savings", filter: (t) => t.category === "Savings", key: "debit_amount" },
  { name: "Housing", filter: (t) => t.category === "Housing", key: "debit_amount" },
  { name: "Transport", filter: (t) => t.category === "Transport", key: "debit_amount" },
  { name: "Expenses", filter: (t) => t.category === "Expenses", key: "debit_amount" },
  { name: "Debits", filter: (t) => t.category === "Debits", key: "debit_amount" },
];

// Define months for grouping
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Process transactions per category
const categoryAverages = categories.reduce((acc, { name, filter, key }) => {
  const filteredTransactions = transactions.filter(filter);

  const groupedData = filteredTransactions.reduce((group, txn) => {
    const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
    const subcategory = txn.subcategory || "Uncategorized";

    if (!group[subcategory]) group[subcategory] = { total: 0 };
    if (!group[subcategory][month]) group[subcategory][month] = 0;

    group[subcategory][month] += txn[key] || 0;
    group[subcategory].total += txn[key] || 0;
    return group;
  }, {});

  const totalByMonth = months.reduce((sum, month) => {
    sum[month] = Object.values(groupedData).reduce((total, subcat) => total + (subcat[month] || 0), 0);
    return sum;
  }, {});

  const grandTotal = Object.values(totalByMonth).reduce((sum, val) => sum + val, 0);
  const validMonthValues = Object.values(totalByMonth).filter((val) => val !== 0);
  const grandAverage = validMonthValues.length > 0
    ? (grandTotal / validMonthValues.length).toFixed(2)
    : "0.00";

  acc[name] = { grandAverage: parseFloat(grandAverage) || 0 };
  return acc;
}, {});

// Extract specific averages for passing to views
const incomeAvg = categoryAverages.Income?.grandAverage || 0;
const savingsAvg = categoryAverages.Savings?.grandAverage || 0;
const housingAvg = categoryAverages.Housing?.grandAverage || 0;
const transportationAvg = categoryAverages.Transport?.grandAverage || 0;
const expensesAvg = categoryAverages.Expenses?.grandAverage || 0;
const debtAvg = categoryAverages.Debits?.grandAverage || 0;



const totalExpenses = savingsAvg + housingAvg + transportationAvg + expensesAvg + debtAvg;
const disposableIncome = incomeAvg - totalExpenses;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl text-white font-bold mb-4">Budget Summary</h2>

      {/* Render the Selected View */}
      <div className="mt-6">
          <SummaryView budgetData={clientData.budgetData} />
      </div>


      {/* Button Bar - More Subtle */}
      <div className="sticky bottom-0 left-0 w-full bg-gray-800 p-4 flex justify-between items-center shadow-md border-t border-gray-700 rounded-t-lg">

        {/* Button Actions */}
        <div className="flex space-x-3">
          <SummaryActions
            notes={notes || []}
            setNote={setNote}
            note={note}
            handleAddNote={() => console.log("Add Note")}
            deleteNote={() => console.log("Delete Note")}
            deleteAllNotes={() => console.log("Delete All Notes")}
          />
        </div>
        {/* Download Button - Lighter Feel */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300"
          onClick={() => generateBudgetReport(clientId, templateBlob)}
        >
          📥 Download Report
        </motion.button>

      </div>



      </div>
  );
};

export default BudgetSummary;



