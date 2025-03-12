import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { TemplateContext } from "components/TemplateContext"; 
import LoadClientData from "components/LoadClientData";
import { generateBudgetReport } from "components/Budget/xlsxModule"; 
import { motion, AnimatePresence } from "framer-motion";
import BudgetSummaryActions1 from "./BudgetSummaryView/BudgetSummaryActions1";
import BudgetSummaryView1 from "./BudgetSummaryView/BudgetSummaryView1";
// import BudgetSummaryView2 from "./BudgetSummaryView/BudgetSummaryView2";
// import BudgetSummaryView3 from "./BudgetSummaryView/BudgetSummaryView3";
// import BudgetSummaryView4 from "./BudgetSummaryView/BudgetSummaryView4";

const BudgetSummary = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [notes, setNotes] = useState([]); 
  const [note, setNote] = useState(""); 
  const [viewMode, setViewMode] = useState(1);
  const db = getFirestore();
  const { templateBlob } = useContext(TemplateContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [id]);

  if (!clientData) return <div className="text-white">Loading client data...</div>;

  const incomeTotal = Math.abs(parseFloat(clientData?.Income?.avgTotal || 0));
  const savingsTotal = Math.abs(parseFloat(clientData?.Savings?.avgTotal || 0));
  const housingTotal = Math.abs(parseFloat(clientData?.Housing?.avgTotal || 0));
  const transportationTotal = Math.abs(parseFloat(clientData?.Transportation?.avgTotal || 0));
  const expensesTotal = Math.abs(parseFloat(clientData?.Expenses?.avgTotal || 0));
  const debtTotal = Math.abs(parseFloat(clientData?.Debt?.avgTotal || 0));

  const totalExpenses = savingsTotal + housingTotal + transportationTotal + expensesTotal + debtTotal;
  const disposableIncome = incomeTotal - totalExpenses;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl text-white font-bold mb-4">Budget Summary</h2>

      {/* View Mode Toggle */}
      <div className="flex space-x-1">
        {[
          { mode: 1, label: "📊" },
          { mode: 2, label: "📋" },
          { mode: 3, label: "🎛️" },
          { mode: 4, label: "🚀" },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-300 shadow-sm ${
              viewMode === mode ? "bg-blue-500 shadow-md" : "bg-gray-800 hover:bg-gray-700 hover:shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Render the Selected View */}
      <div className="mt-6">
        {viewMode === 1 ? (
          <BudgetSummaryView1
            incomeTotal={clientData?.Income?.avgTotal || 0}
            savingsTotal={clientData?.Savings?.avgTotal || 0}
            housingTotal={clientData?.Housing?.avgTotal || 0}
            transportationTotal={clientData?.Transportation?.avgTotal || 0}
            expensesTotal={clientData?.Expenses?.avgTotal || 0}
            debtTotal={clientData?.Debt?.avgTotal || 0}
          />
        ) : viewMode === 2 ? (
          <BudgetSummaryView2 insurance={clientData.insurance} />
        ) : viewMode === 3 ? (
          <BudgetSummaryView3 insurance={clientData.insurance} />
        ) : (
          <BudgetSummaryView4 insurance={clientData.insurance} />
        )}
      </div>

      {/* Client Actions */}
      <div className="mt-6">
      <BudgetSummaryActions1
        notes={notes || []}  // ✅ Ensures notes is always an array
        setNote={setNote}
        note={note}
        handleAddNote={() => console.log("Add Note")}
        deleteNote={() => console.log("Delete Note")}
        deleteAllNotes={() => console.log("Delete All Notes")}
        
      />

{/* Download Button - Centered & Animated */}
<div className="flex justify-center mt-6">
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-blue-500/40"
    onClick={() => generateBudgetReport(id, templateBlob)}
  >
    📥 Download Budget Report
  </motion.button>
</div>


      </div>
    </div>
  );
};

export default BudgetSummary;
