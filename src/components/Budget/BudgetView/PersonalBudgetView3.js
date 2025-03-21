import React from "react";
import moment from "moment";

const PersonalBudgetView3 = ({ transactions }) => {
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
    <div className="p-6 bg-white shadow-lg rounded-xl">
      {categories.map(({ name, filter, key }) => {
        const filteredTransactions = transactions.filter(filter);
        const groupedData = filteredTransactions.reduce((acc, txn) => {
          const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
          const subcategory = txn.subcategory || "Uncategorized";
          
          if (!acc[subcategory]) {
            acc[subcategory] = { total: 0, count: 0 };
          }
          
          if (!acc[subcategory][month]) {
            acc[subcategory][month] = 0;
          }
          
          acc[subcategory][month] += txn[key] || 0;
          acc[subcategory].total += txn[key] || 0;
          acc[subcategory].count += txn[key] ? 1 : 0;
          return acc;
        }, {});

        const totalByMonth = months.reduce((acc, month) => {
          acc[month] = Object.values(groupedData).reduce((sum, subcat) => sum + (subcat[month] || 0), 0);
          return acc;
        }, {});

        const avgByMonth = months.reduce((acc, month) => {
          const values = Object.values(groupedData).map(subcat => subcat[month] || 0).filter(val => val !== 0);
          const count = values.length;
          acc[month] = count > 0 ? (values.reduce((sum, val) => sum + val, 0) / count).toFixed(2) : "-";
          return acc;
        }, {});

        const grandTotal = Object.values(groupedData).reduce((sum, subcat) => sum + subcat.total, 0);
        const validMonthValues = Object.values(totalByMonth).filter(value => value !== 0);
        const grandAverage = validMonthValues.length > 0 
          ? (validMonthValues.reduce((sum, val) => sum + val, 0) / validMonthValues.length).toFixed(2) 
          : "0.00";

        return (
          <div key={name} className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-3 uppercase">{name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-md rounded-md bg-white">
                <thead className="bg-blue-500 text-white text-sm">
                  <tr>
                    <th className="p-3 border border-blue-700">Subcategory</th>
                    {months.map((month) => (
                      <th key={month} className="p-3 border border-blue-700 text-center">{month}</th>
                    ))}
                    <th className="p-3 border border-blue-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedData).map(([subcategory, monthData], idx) => (
                    <tr key={subcategory} className={`border-b ${idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100"}`}>
                      <td className="p-3 border border-blue-300 font-semibold">{subcategory}</td>
                      {months.map((month) => (
                        <td key={month} className="p-3 text-right border border-blue-300">
                          {monthData[month] ? `R ${parseFloat(monthData[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                      ))}
                      <td className="p-3 text-right font-bold border border-blue-500">R {parseFloat(monthData.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-200 text-gray-800 font-bold">
                  <tr>
                    <td className="p-3 border border-blue-400">TOTAL</td>
                    {months.map((month) => (
                      <td key={month} className="p-3 text-right border border-blue-400">
                        {totalByMonth[month] ? `R ${parseFloat(totalByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                    ))}
                    <td className="p-3 text-right border border-blue-600">R {parseFloat(grandTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-blue-400">AVERAGE</td>
                    {months.map((month) => (
                      <td key={month} className="p-3 text-right border border-blue-400">
                        {avgByMonth[month] !== "-" ? `R ${parseFloat(avgByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                    ))}
                    <td className="p-3 text-right border border-blue-600">R {parseFloat(grandAverage).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
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

export default PersonalBudgetView3;
