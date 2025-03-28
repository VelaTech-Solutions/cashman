import React from "react";
import { motion } from "framer-motion";

const BudgetSummaryView2 = ({
  incomeAvg = 0,
  savingsAvg = 0,
  housingAvg = 0,
  transportationAvg = 0,
  expensesAvg = 0,
  debtAvg = 0,
}) => {
  const totalExpenses = savingsAvg + housingAvg + transportationAvg + expensesAvg + debtAvg;
  const disposableIncome = incomeAvg - totalExpenses;

  const categories = [
    { name: "INCOME", amount: incomeAvg, color: "bg-gray-500" },
    { name: "SAVINGS", amount: savingsAvg, color: "bg-green-500" },
    { name: "HOUSING", amount: housingAvg, color: "bg-blue-500" },
    { name: "TRANSPORTATION", amount: transportationAvg, color: "bg-yellow-500" },
    { name: "EXPENSES", amount: expensesAvg, color: "bg-red-500" },
    { name: "DEBT", amount: debtAvg, color: "bg-purple-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-white text-lg font-bold mb-4">
        Your monthly expenditure summary
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="bg-gray-800 p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-white">{category.name}</span>
              <span className="text-gray-400">R {category.amount.toFixed(2)}</span>
            </div>
            <div className={`h-2 rounded-full ${category.color}`} style={{ width: `${(category.amount / incomeAvg) * 100}%` }}></div>
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

export default BudgetSummaryView2;
