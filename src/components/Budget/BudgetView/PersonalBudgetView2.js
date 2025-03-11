import React from "react";
import moment from "moment";

const PersonalBudgetView2 = ({ transactions }) => {
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
          <div key={name} className="mb-4 p-4 border border-gray-400 rounded-md">
            <h3 className="font-semibold border-b pb-2 mb-2">{name}</h3>
            <table className="w-full border-collapse border border-gray-400 text-left">
              <thead>
                <tr>
                  <th className="border border-gray-400 p-2">Subcategory</th>
                  {months.map((month) => (
                    <th key={month} className="border border-gray-400 p-2 text-center">{month}</th>
                  ))}
                  <th className="border border-gray-400 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedData).map(([subcategory, monthData], idx) => (
                  <tr key={subcategory} className={`border-b ${idx % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}`}>
                    <td className="p-2 border border-gray-400">{subcategory}</td>
                    {months.map((month) => (
                      <td key={month} className="p-2 text-right border border-gray-400">
                        {monthData[month] ? `R ${parseFloat(monthData[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                    ))}
                    <td className="p-2 text-right font-bold border border-gray-400">
                      R {parseFloat(monthData.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-2 border border-gray-400 font-bold">TOTAL</td>
                  {months.map((month) => (
                    <td key={month} className="p-2 text-right font-bold border border-gray-400">
                      {totalByMonth[month] ? `R ${parseFloat(totalByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  ))}
                  <td className="p-2 text-right font-bold border border-gray-400">R {parseFloat(grandTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-400 font-bold">AVERAGE</td>
                  {months.map((month) => (
                    <td key={month} className="p-2 text-right font-bold border border-gray-400">
                      {avgByMonth[month] ? `R ${parseFloat(avgByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                  ))}
                  <td className="p-2 text-right font-bold border border-gray-400">R {parseFloat(grandAverage).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalBudgetView2;
