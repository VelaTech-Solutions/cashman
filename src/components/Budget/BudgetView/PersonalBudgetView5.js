import React from "react";
import moment from "moment";

const PersonalBudgetView5 = ({ transactions }) => {
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

  return (
    <div className="p-4">
      {categories.map(({ name, filter, key }) => {
        const filteredTransactions = transactions.filter(filter);
        const groupedData = filteredTransactions.reduce((acc, txn) => {
          const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += txn[key] || 0;
          return acc;
        }, {});

        return (
          <div key={name} className="mb-4 p-2 border border-gray-300 rounded-md text-xs">
            <h3 className="font-semibold text-blue-200 text-sm mb-2">{name} : Monthly Total</h3>
            <div className="grid grid-cols-12 gap-2">
              {months.map((month) => (
                <div key={month} className="p-3 bg-blue-200 text-center rounded-md shadow-sm">
                  <p className="text-xs font-semibold text-gray-600">{month}</p>
                  <p className="text-sm font-bold text-gray-800"> {groupedData[month] ? groupedData[month].toLocaleString("en-ZA", { minimumFractionDigits: 2 }) : "0.00"}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalBudgetView5;