import React from "react";
import { Bar } from "react-chartjs-2";
import moment from "moment";
import "chart.js/auto";

const PersonalBudgetView6 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-6">No transactions available</div>;
  }

  const categories = [
    { name: "Income", filter: (t) => t.category === "Income", key: "credit_amount" },
    { name: "Savings", filter: (t) => t.category === "Savings", key: "debit_amount" },
    { name: "Housing", filter: (t) => t.category === "Housing", key: "debit_amount" },
    { name: "Transport", filter: (t) => t.category === "Transportation", key: "debit_amount" },
    { name: "Expenses", filter: (t) => t.category === "Expenses", key: "debit_amount" },
    { name: "Debits", filter: (t) => t.category === "Debits", key: "debit_amount" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Aggregate data for the chart
  const chartData = {
    labels: months,
    datasets: categories.map(({ name, filter, key }) => {
      const monthlyTotals = months.map((month) => {
        return transactions
          .filter(filter)
          .filter((txn) => moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM") === month)
          .reduce((sum, txn) => sum + (txn[key] || 0), 0);
      });

      return {
        label: name,
        data: monthlyTotals,
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`,
      };
    }),
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Budget Overview (Graph View)</h2>
      <div className="w-full h-[400px]">
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default PersonalBudgetView6;
