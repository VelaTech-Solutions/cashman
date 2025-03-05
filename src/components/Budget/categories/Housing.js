
import React, { useState } from "react";
import moment from "moment";

const Housing = ({ transactions }) => {

    const [isExpanded, setIsExpanded] = useState(false); // State to toggle transactions visibility

    const toggleTransactions = () => {
      setIsExpanded((prev) => !prev);
    };
  const housingTransactions = transactions?.filter((txn) => txn.category?.toLowerCase() === "housing") || [];

  // Group transactions by subcategory and month
  const groupedData = housingTransactions.reduce((acc, txn) => {
    const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
    const subcategory = txn.subcategory || "Uncategorized";
    
    if (!acc[subcategory]) {
      acc[subcategory] = { total: 0, count: 0 };
    }
    
    if (!acc[subcategory][month]) {
      acc[subcategory][month] = 0;
    }
    
    acc[subcategory][month] += txn.debit_amount || 0;
    acc[subcategory].total += txn.debit_amount || 0;
    acc[subcategory].count += txn.debit_amount ? 1 : 0;
    return acc;
  }, {});

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const grandTotal = Object.values(groupedData).reduce((sum, subcat) => sum + subcat.total, 0);
  const totalByMonth = months.reduce((acc, month) => {
    acc[month] = Object.values(groupedData).reduce((sum, subcat) => sum + (subcat[month] || 0), 0);
    return acc;
  }, {});
  const avgByMonth = months.reduce((acc, month) => {
    const values = Object.values(groupedData)
      .map(subcat => subcat[month] || 0)
      .filter(val => val !== 0);
    const count = values.length; // Count only months with values
    acc[month] = count > 0 ? (values.reduce((sum, val) => sum + val, 0) / count).toFixed(2) : "-";
    return acc;
  }, {});
  
  const validMonthValues = Object.values(totalByMonth).filter(value => value !== 0);
  const validMonthCount = validMonthValues.length;
  
  const grandAverage = validMonthCount > 0 
    ? (validMonthValues.reduce((sum, val) => sum + val, 0) / validMonthCount).toFixed(2) 
    : "0.00";
  
    console.log("Total By Month:", totalByMonth);
    console.log("Valid Month Values:", validMonthValues);
    console.log("Valid Month Count:", validMonthCount);
    console.log("Calculated Average:", grandAverage);
    
  return (
    <div className="mb-8 border border-gray-600 rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold bg-gray-700 text-white py-3 px-4 flex justify-between">
            Housing
            <button
            onClick={toggleTransactions}
            className="text-white text-lg font-bold focus:outline-none"
            >
            {isExpanded ? "Dpan▼" : "Epan ▶"} {/* Toggle Icon */}
            </button>
        </h3>

        {/* 🚀 Scrollable Transactions Section (Auto-Hide Scroll) */}
        <div className="relative max-h-[400px] overflow-y-auto" style={{ maxHeight: groupedData.length > 5 ? "400px" : "auto" }}>
            <table className="w-full border-collapse">
                {/* Sticky Header */}
                <thead className="sticky top-0 bg-gray-700 text-white z-10">
                <tr>
                    <th className="p-4 border border-gray-600 w-1/18 text-left">Subcategory</th>
                    {months.map((month) => (
                    <th key={month} className="p-4 border border-gray-600 w-1/18 text-center">{month}</th>
                    ))}
                    <th className="p-4 border border-gray-600 w-1/18 text-right">Total</th>
                </tr>
                </thead>

                    {/* Collapsible Transactions Body */}
                    <tbody className={isExpanded ? "" : "hidden"}>
                    {Object.entries(groupedData).map(([subcategory, monthData], idx) => (
                        <tr key={subcategory} className={`border-b ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}>
                        <td className="p-4 text-white text-left border border-gray-600">{subcategory}</td>
                        {months.map((month) => (
                            <td key={month} className="p-4 text-right text-white border border-gray-600">
                            {monthData[month] ? `R ${parseFloat(monthData[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                            </td>
                        ))}
                        <td className="p-4 text-right text-white font-bold border border-gray-600">
                            R {parseFloat(monthData.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </td>
                        </tr>
                    ))}
                    </tbody>

                {/* Sticky Totals Row */}
                <tfoot className="sticky bottom-0 bg-gray-700 text-white">
                    <tr>
                        <td className="p-4 text-white text-left border border-gray-600 min-w-[120px]">TOTAL</td>
                        {months.map((month) => (
                            <td key={month} className="p-4 text-right text-white border border-gray-600 min-w-[100px]">
                                {totalByMonth[month] ? `R ${parseFloat(totalByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                            </td>
                        ))}
                        <td className="p-4 text-right text-white font-bold border border-gray-600 min-w-[120px]">
                            R {parseFloat(grandTotal).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </td>
                    </tr>

                    <tr>
                        <td className="p-4 text-white text-left border border-gray-600 min-w-[120px]">AVERAGE</td>
                        {months.map((month) => (
                            <td key={month} className="p-4 text-right text-white border border-gray-600 min-w-[100px]">
                                {avgByMonth[month] ? `R ${parseFloat(avgByMonth[month]).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : "-"}
                            </td>
                        ))}
                        <td className="p-4 text-right text-white font-bold border border-gray-600 min-w-[120px]">
                            R {parseFloat(grandAverage).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  );
};

export default Housing;