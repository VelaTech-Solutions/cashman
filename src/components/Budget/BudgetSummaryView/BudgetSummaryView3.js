import React from "react";
import { motion } from "framer-motion";

const BudgetSummaryView3 = ({
  incomeTotal = 0,
  savingsTotal = 0,
  housingTotal = 0,
  transportationTotal = 0,  expensesTotal = 0,
  debtTotal = 0,
}) => {
  const totalExpenses = savingsTotal + housingTotal + transportationTotal + expensesTotal + debtTotal;
  const disposableIncome = incomeTotal - totalExpenses;

  return (
    <div className="p-6 space-y-6">
      <div className="text-white text-lg font-bold mb-4">
        Budget Overview - Income and Deductions
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-green-400">Total Income</span>
          <span className="text-gray-200">R {incomeTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "SAVINGS", amount: savingsTotal, color: "bg-green-500" },
          { name: "HOUSING", amount: housingTotal, color: "bg-blue-500" },
          { name: "TRANSPORTATION", amount: transportationTotal, color: "bg-yellow-500" },
          { name: "EXPENSES", amount: expensesTotal, color: "bg-red-500" },
          { name: "DEBT", amount: debtTotal, color: "bg-purple-500" },
        ].map((category, index) => (
          <motion.div
            key={index}
            className="bg-gray-700 p-4 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white">{category.name}</span>
              <span className="text-gray-400">R {category.amount.toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mt-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">Total Disposable Income</span>
          <span className={`font-semibold ${disposableIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
            R {disposableIncome.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryView3;
