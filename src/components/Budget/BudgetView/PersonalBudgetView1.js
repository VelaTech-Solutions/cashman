import React, { useState } from "react";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const PersonalBudgetView1 = ({ transactions, clientId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  const calculateBudget = async () => {
    setLoading(true);
    setMessage("");

    let budgetTotals = {};
    let budgetAverages = {};

    categories.forEach(({ name, filter, key }) => {
      const categoryTransactions = transactions.filter(filter);
      const total = categoryTransactions.reduce((sum, txn) => sum + (parseFloat(txn[key]) || 0), 0);
      const monthsWithData = new Set(categoryTransactions.map(txn => moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM")));
      const avg = monthsWithData.size > 0 ? total / monthsWithData.size : 0;

      budgetTotals[name.toLowerCase()] = parseFloat(total.toFixed(2));
      budgetAverages[`${name.toLowerCase()}avg`] = parseFloat(avg.toFixed(2));
    });

    try {
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, {
        budgetData: {
          ...budgetTotals,
          ...budgetAverages,
          timestamp: new Date().toISOString(),
        },
      });

      setMessage("✅ Budget calculated & saved successfully!");
    } catch (error) {
      console.error("🔥 Error saving budget:", error);
      setMessage("❌ Failed to save budget.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={calculateBudget}
        className="px-6 py-3 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        disabled={loading}
      >
        {loading ? "Calculating..." : "📊 Calculate & Save Budget"}
      </button>
      {message && <p className="text-center text-lg font-bold text-green-400">{message}</p>}

      {categories.map(({ name, filter, key }) => {
        const filteredTransactions = transactions.filter(filter);
        const groupedData = filteredTransactions.reduce((acc, txn) => {
          const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
          const subcategory = txn.subcategory || "Uncategorized";

          if (!acc[subcategory]) acc[subcategory] = { total: 0 };
          if (!acc[subcategory][month]) acc[subcategory][month] = 0;

          acc[subcategory][month] += parseFloat(txn[key]) || 0;
          acc[subcategory].total += parseFloat(txn[key]) || 0;
          return acc;
        }, {});

        const totalByMonth = months.reduce((acc, month) => {
          acc[month] = Object.values(groupedData).reduce((sum, subcat) => sum + (subcat[month] || 0), 0);
          return acc;
        }, {});

        const grandTotal = Object.values(totalByMonth).reduce((sum, val) => sum + val, 0).toFixed(2);
        const validMonths = Object.values(totalByMonth).filter((value) => value !== 0);
        const grandAverage = validMonths.length > 0 ? (grandTotal / validMonths.length).toFixed(2) : "0.00";

        return (
          <div key={name} className="mb-4 p-2 border border-gray-300 rounded-md text-xs">
            <h3 className="text-lg font-semibold">{name} (Total: R {grandTotal} | Avg: R {grandAverage})</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-2 border border-gray-400 text-left">Subcategory</th>
                    {months.map((month) => (
                      <th key={month} className="p-2 border border-gray-400 text-center">{month}</th>
                    ))}
                    <th className="p-2 border border-gray-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedData).map(([subcategory, monthData]) => (
                    <tr key={subcategory} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-400 font-semibold">{subcategory}</td>
                      {months.map((month) => (
                        <td key={month} className="p-2 text-right border border-gray-400">
                          {monthData[month] ? `R ${monthData[month].toFixed(2)}` : "-"}
                        </td>
                      ))}
                      <td className="p-2 text-right font-bold border border-gray-500">R {monthData.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-2 border border-gray-400 font-bold">TOTAL</td>
                    {months.map((month) => (
                      <td key={month} className="p-2 text-right border border-gray-400 font-bold">
                        {totalByMonth[month] ? `R ${totalByMonth[month].toFixed(2)}` : "-"}
                      </td>
                    ))}
                    <td className="p-2 text-right border border-gray-600 font-bold">R {grandTotal}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-400 font-bold">AVERAGE</td>
                    {months.map((month) => (
                      <td key={month} className="p-2 text-right border border-gray-400 font-bold">
                        {totalByMonth[month] > 0 ? `R ${(totalByMonth[month] / validMonths.length).toFixed(2)}` : "-"}
                      </td>
                    ))}
                    <td className="p-2 text-right border border-gray-600 font-bold">R {grandAverage}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalBudgetView1;
