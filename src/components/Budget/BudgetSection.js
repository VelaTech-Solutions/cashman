import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

// Components Imports
import LoadClientData from "components/LoadClientData";
import Table from "components/Table";

// Firebase Imports
import { getFirestore } from "firebase/firestore";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const budgetCategories = ["Income", "Savings", "Housing", "Transportation", "Expenses", "Debt"];

const BudgetSection = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [id]);

  // Toggles a single category open/closed
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const processTransactions = (category) => {
    if (!clientData?.transactions) {
      return { monthlyTotals: {}, avgTotal: "0.00", totalSum: "0.00" };
    }

    // 1) Filter by category (case-insensitive)
    const categoryTransactions = clientData.transactions.filter((txn) => {
      if (!txn.category) return false;
      return txn.category.toLowerCase() === category.toLowerCase();
    });

    // 2) Sum amounts by month
    const groupedData = categoryTransactions.reduce((acc, txn) => {
      // Safely parse the amount. If you store something like "R 200", remove non-numerics first.
      const rawAmount = txn.debit_amount || txn.credit_amount || "0";
      const numericAmount = parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, "")) || 0;

      // 3) Parse date from multiple possible formats
      const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
      acc[month] = (parseFloat(acc[month] || 0) + numericAmount).toFixed(2);
      return acc;
    }, {});

    // 4) Compute total sum
    const totalSum = Object.values(groupedData)
      .reduce((sum, value) => sum + parseFloat(value), 0)
      .toFixed(2);

    // 5) Compute average (only across nonzero months)
    const totalValues = Object.values(groupedData).map(parseFloat).filter((val) => val !== 0);
    const avgTotal = totalValues.length
      ? (totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length).toFixed(2)
      : "0.00";

    return { monthlyTotals: groupedData, avgTotal, totalSum };
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      {budgetCategories.map((category) => {
        // Process totals for this category
        const { monthlyTotals, avgTotal, totalSum } = processTransactions(category);

        // Get all transactions for this category
        const categoryTransactions = clientData?.transactions?.filter((txn) => {
          return txn.category && txn.category.toLowerCase() === category.toLowerCase();
        }) || [];

        // Group by subcategory
        const subcategories = categoryTransactions.reduce((acc, txn) => {
          const subcat = txn.subcategory || "Uncategorized";
          if (!acc[subcat]) {
            acc[subcat] = {
              name: subcat,
              monthlyTotals: {},
              total: 0,
            };
          }

          // Parse amount safely
          const rawAmount = txn.debit_amount || txn.credit_amount || "0";
          const numericAmount = parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, "")) || 0;

          // Parse date
          const month = moment(txn.date1, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("MMM");
          acc[subcat].monthlyTotals[month] = (
            parseFloat(acc[subcat].monthlyTotals[month] || 0) + numericAmount
          ).toFixed(2);
          acc[subcat].total = (parseFloat(acc[subcat].total) + numericAmount).toFixed(2);

          return acc;
        }, {});

        const subcategoryList = Object.values(subcategories);

        return (
          <div key={category} className="mb-6 border border-gray-600 rounded-lg overflow-hidden">
            {/* Category header */}
            <button
              className="w-full text-left text-lg font-semibold py-2 px-4 bg-gray-700 text-white rounded"
              onClick={() => toggleCategory(category)}
            >
              {category.toUpperCase()} {expandedCategories[category] ? "▼" : "▶"}
            </button>

            {/* Category table (shown only if expanded) */}
            {expandedCategories[category] && (
              <Table className="w-full table-fixed border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="p-3 border border-gray-600 w-1/6">Subcategory</th>
                    {months.map((month) => (
                      <th key={month} className="p-3 border border-gray-600 w-1/12">
                        {month}
                      </th>
                    ))}
                    <th className="p-3 border border-gray-600 w-1/6">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategoryList.length > 0 ? (
                    subcategoryList.map((sub, idx) => (
                      <tr
                        key={sub.name}
                        className={`border-b ${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}
                      >
                        <td className="p-3 font-semibold text-white">{sub.name}</td>
                        {months.map((month) => (
                          <td key={month} className="p-3 text-center">
                            {sub.monthlyTotals[month] ? `R ${sub.monthlyTotals[month]}` : "-"}
                          </td>
                        ))}
                        <td className="p-3 text-blue-400 font-bold">R {sub.total}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b bg-gray-900">
                      <td className="p-3 font-semibold text-white">{category}</td>
                      <td className="p-3 text-center text-gray-400" colSpan={months.length + 1}>
                        No data available
                      </td>
                    </tr>
                  )}

                  {/* Category Totals Row */}
                  <tr className="bg-gray-900 text-yellow-400 font-semibold">
                    <td className="p-3 border border-gray-600">TOTAL</td>
                    {months.map((m) => (
                      <td key={m} className="p-3 text-center font-bold border border-gray-600">
                        {monthlyTotals[m] ? `R ${monthlyTotals[m]}` : "-"}
                      </td>
                    ))}
                    <td className="p-3 text-yellow-400 font-bold border border-gray-600">
                      R {totalSum}
                    </td>
                  </tr>

                  {/* Category Average Row */}
                  <tr className="bg-gray-700 text-green-400 font-semibold">
                    <td className="p-3 border border-gray-600">AVERAGE</td>
                    {months.map((m, i) => (
                      <td key={m} className="p-3 text-center font-bold border border-gray-600">
                        {/* Only show the average in the first cell (or you could distribute it) */}
                        {i === 0 ? `R ${avgTotal}` : ""}
                      </td>
                    ))}
                    <td className="p-3 text-green-400 font-bold border border-gray-600">-</td>
                  </tr>
                </tbody>
              </Table>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BudgetSection;
