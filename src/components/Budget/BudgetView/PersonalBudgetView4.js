import React, { useState } from "react";
import moment from "moment";

const PersonalBudgetView4 = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center py-6">No transactions available</div>;
  }

  const categories = [
    { name: "Income", filter: (t) => t.category === "Income", key: "credit_amount" },
    { name: "Savings", filter: (t) => t.category === "Savings", key: "debit_amount" },
    { name: "Housing", filter: (t) => t.category === "Housing", key: "debit_amount" },
    { name: "Transport", filter: (t) => t.category === "Transport", key: "debit_amount" },
    { name: "Expenses", filter: (t) => t.category === "Expenses", key: "debit_amount" },
    { name: "Debits", filter: (t) => t.category === "Debits", key: "debit_amount" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="p-4">
      {categories.map(({ name, filter, key }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const filteredTransactions = transactions.filter(filter);
        const groupedData = filteredTransactions.reduce((acc, txn) => {
          const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
          const subcategory = txn.subcategory || "Uncategorized";
          
          if (!acc[subcategory]) {
            acc[subcategory] = { total: 0 };
          }
          
          if (!acc[subcategory][month]) {
            acc[subcategory][month] = 0;
          }
          
          acc[subcategory][month] += txn[key] || 0;
          acc[subcategory].total += txn[key] || 0;
          return acc;
        }, {});

        const totalByMonth = months.reduce((acc, month) => {
          acc[month] = Object.values(groupedData).reduce((sum, subcat) => sum + (subcat[month] || 0), 0);
          return acc;
        }, {});

        const validMonthValues = Object.values(totalByMonth).filter(value => value !== 0);
        const grandTotal = validMonthValues.reduce((sum, val) => sum + val, 0).toFixed(2);
        const grandAverage = validMonthValues.length > 0
          ? (grandTotal / validMonthValues.length).toFixed(2)
          : "0.00";

        return (
          <div key={name} className="mb-4 p-2 border border-gray-300 rounded-md text-xs">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="w-full text-left font-semibold py-2 px-3 bg-gray-200 text-gray-700 rounded-md focus:outline-none"
            >
              {isExpanded ? `▼ ${name} (Total: R ${grandTotal} | Avg: R ${grandAverage})` : `▶ ${name} (Total: R ${grandTotal} | Avg: R ${grandAverage})`}
            </button>
            {isExpanded && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="p-2 border border-gray-400 text-left min-w-[80px]">Subcategory</th>
                      {months.map((month) => (
                        <th key={month} className="p-2 border border-gray-400 text-center min-w-[50px]">{month}</th>
                      ))}
                      <th className="p-2 border border-gray-400 text-right min-w-[80px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedData).map(([subcategory, monthData]) => (
                      <tr key={subcategory} className="border-b border-gray-300">
                        <td className="p-2 border border-gray-400 font-semibold whitespace-nowrap">{subcategory}</td>
                        {months.map((month) => (
                          <td key={month} className="p-2 text-right border border-gray-400">
                            {monthData[month] ? `R ${parseFloat(monthData[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                          </td>
                        ))}
                        <td className="p-2 text-right font-bold border border-gray-500">R {parseFloat(monthData.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-2 border border-gray-400 font-bold">TOTAL</td>
                      {months.map((month) => (
                        <td key={month} className="p-2 text-right border border-gray-400 font-bold">
                          {totalByMonth[month] ? `R ${parseFloat(totalByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                      ))}
                      <td className="p-2 text-right border border-gray-600 font-bold">R {grandTotal}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-400 font-bold">AVERAGE</td>
                      {months.map((month) => (
                        <td key={month} className="p-2 text-right border border-gray-400 font-bold">
                          {totalByMonth[month] > 0 ? `R ${parseFloat((totalByMonth[month] / validMonthValues.length).toFixed(2)).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                      ))}
                      <td className="p-2 text-right border border-gray-600 font-bold">R {grandAverage}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PersonalBudgetView4;