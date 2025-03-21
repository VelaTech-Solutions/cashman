import React from "react";

const PersonalBudgetView4 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-6">No transactions available</div>;
  }

  const categories = [
    { name: "Income", filter: (t) => t.category === "Income" },
    { name: "Savings", filter: (t) => t.category === "Savings" },
    { name: "Housing", filter: (t) => t.category === "Housing" },
    { name: "Transport", filter: (t) => t.category === "Transportation" },
    { name: "Expenses", filter: (t) => t.category === "Expenses" },
    { name: "Debits", filter: (t) => t.category === "Debits" },
  ];

  return (
    <div className="p-4">
      {categories.map(({ name, filter }) => (
        <div key={name} className="mb-4 border border-black p-2">
          <h3 className="font-bold text-black border-b border-black pb-1">{name}</h3>
          <table className="w-full border-collapse border border-black text-left text-black">
            <thead>
              <tr className="border border-black">
                <th className="border border-black p-1">Description</th>
                <th className="border border-black p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(filter).map((transaction, index) => (
                <tr key={index} className="border border-black">
                  <td className="border border-black p-1">{transaction.description}</td>
                  <td className="border border-black p-1">{transaction.amount}</td>
                </tr>
              ))}
              {transactions.filter(filter).length === 0 && (
                <tr>
                  <td colSpan="2" className="border border-black p-1 text-center">No transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PersonalBudgetView4;
