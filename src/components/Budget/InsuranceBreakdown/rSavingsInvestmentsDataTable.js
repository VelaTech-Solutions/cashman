import React, { useState } from "react";


const RSavingsInvestmentsDataTable = ({ transactions }) => {
  const maxRows = 14;

  // Ensure transactions have exactly 14 rows
  const [tableData, setTableData] = useState(() => {
    const slicedTransactions = transactions.slice(0, maxRows);
    while (slicedTransactions.length < maxRows) {
      slicedTransactions.push({ r_si_institution: "", type: "", amount: "" });
    }
    return slicedTransactions;
  });

  // Handle input changes
  const handleChange = (index, field, value) => {
    const newData = [...tableData];
    newData[index][field] = value;
    setTableData(newData);
  };

  // Calculate total amount
  const totalAmount = tableData.reduce(
    (acc, item) => acc + (Number(item.amount) || 0),
    0
  );

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-3 max-w-[600px] mx-auto">
      <h2 className="text-sm text-white font-semibold mb-2">
        Savings &amp; Investments
      </h2>
  
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-600 text-left text-xs">
          <thead>
            <tr className="bg-gray-700 text-white border-b border-gray-600">
              <th className="py-0.5 px-2 border-r border-gray-600 w-1/2">Institution</th>
              <th className="py-0.5 px-2 border-r border-gray-600 w-1/3">Type</th>
              <th className="py-0.5 px-2 border-gray-600 w-1/4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border-b border-gray-600 last:border-b-0">
                <td className="py-0.5 px-2 border-r border-gray-600 text-gray-200">
                  <input
                    type="text"
                    value={row.r_si_institution}
                    onChange={(e) => handleChange(index, "institution", e.target.value)}
                    className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                  />
                </td>
                <td className="py-0.5 px-2 border-r border-gray-600 text-gray-200">
                  <input
                    type="text"
                    value={row.type}
                    onChange={(e) => handleChange(index, "type", e.target.value)}
                    className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                  />
                </td>
                <td className="py-0.5 px-2 border-r border-gray-600 text-gray-200 text-right">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => handleChange(index, "amount", e.target.value)}
                    className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs text-right rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
  
          <tfoot>
            <tr className="bg-gray-700 text-white border-t border-gray-600">
              <td className="py-0.5 px-2 border-r border-gray-600 font-bold text-xs">Total</td>
              <td className="py-0.5 px-2 border-r border-gray-600 font-bold text-xs">-</td>
              <td className="py-0.5 px-2 border-r border-gray-600 font-bold text-xs">
                R {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default RSavingsInvestmentsDataTable;