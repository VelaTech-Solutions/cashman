// src/pages/ViewReports.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const ViewReports = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUncategorized, setShowUncategorized] = useState(true);

  const [showIncome, setShowIncome] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [showHousing, setShowHousing] = useState(false);
  const [showTransportation, setShowTransportation] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showDebt, setShowDebt] = useState(false);

  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error("Error fetching client data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="View Reports" links={links} />

      <div className="flex-1 p-8">
        {/* Block to show all calculations or like a summary */}
        {/* Financial Summary Section */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowSummary(!showSummary)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Financial Summary
            <span className="text-gray-500">{showSummary ? "▲" : "▼"}</span>
          </h2>

          {showSummary && (
            <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* Total Income */}
                <div className="bg-green-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Income</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) =>
                          txn.credit_amount &&
                          (txn.category === "Income" || !txn.category),
                      )
                      .reduce((acc, txn) => acc + txn.credit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Savings */}
                <div className="bg-blue-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Savings</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Savings",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Housing */}
                <div className="bg-purple-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Housing</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Housing",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Transport */}
                <div className="bg-yellow-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Transport</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) =>
                          txn.debit_amount && txn.category === "Transportation",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-red-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Expenses</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) =>
                          txn.debit_amount && txn.category === "Expenses",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Debt */}
                <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Debt</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Debt",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* income block */}
        {/* Income Transactions Block */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowIncome(!showIncome)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Income Transactions
            <span className="text-gray-500">{showIncome ? "▲" : "▼"}</span>
            <span className="ml-4 bg-green-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) =>
                    txn.credit_amount &&
                    (txn.category === "Income" || !txn.category),
                ).length
              }
              incomes
            </span>
          </h2>

          {/* Display Total Income */}
          <div className="bg-gray-900 p-3 text-green-400 font-semibold rounded-md">
            Total Income: R
            {transactions
              .filter(
                (txn) =>
                  txn.credit_amount &&
                  (txn.category === "Income" || !txn.category),
              )
              .reduce((acc, txn) => acc + txn.credit_amount, 0)
              .toFixed(2)}
          </div>

          {showIncome &&
          transactions.filter(
            (txn) =>
              txn.credit_amount && (txn.category === "Income" || !txn.category),
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Subcategory</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(
                      (txn) =>
                        txn.credit_amount &&
                        (txn.category === "Income" || !txn.category),
                    )
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">
                          {txn.category || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.credit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showIncome && (
              <p className="text-center text-lg text-gray-500">
                No income transactions found.
              </p>
            )
          )}
        </section>

        {/* Saving Block */}
        {/* Savings Transactions Block */}
        <section className="space-y-4">
          {/* Section Header with Transaction Count & Collapsibility */}
          <h2
            onClick={() => setShowSavings(!showSavings)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Savings Transactions
            <span className="text-gray-500">{showSavings ? "▲" : "▼"}</span>
            <span className="ml-4 bg-blue-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) => txn.debit_amount && txn.category === "Savings",
                ).length
              }
              savings
            </span>
          </h2>

          {/* Display Total Savings */}
          <div className="bg-gray-900 p-3 text-blue-400 font-semibold rounded-md">
            Total Savings: R
            {transactions
              .filter((txn) => txn.debit_amount && txn.category === "Savings")
              .reduce((acc, txn) => acc + txn.debit_amount, 0)
              .toFixed(2)}
          </div>

          {/* Scrollable Transactions List */}
          {showSavings &&
          transactions.filter(
            (txn) => txn.debit_amount && txn.category === "Savings",
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Subcategory</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(
                      (txn) => txn.debit_amount && txn.category === "Savings",
                    )
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">{txn.category}</td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.debit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showSavings && (
              <p className="text-center text-lg text-gray-500">
                No savings transactions found.
              </p>
            )
          )}
        </section>

        {/* Housing Block */}
        {/* Housing Transactions Block */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowHousing(!showHousing)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Housing Transactions
            <span className="text-gray-500">{showHousing ? "▲" : "▼"}</span>
            <span className="ml-4 bg-purple-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) => txn.debit_amount && txn.category === "Housing",
                ).length
              }
              Housing
            </span>
          </h2>

          {/* Display Total Housing */}
          <div className="bg-gray-900 p-3 text-purple-400 font-semibold rounded-md">
            Total Housing: R
            {transactions
              .filter((txn) => txn.debit_amount && txn.category === "Housing")
              .reduce((acc, txn) => acc + txn.debit_amount, 0)
              .toFixed(2)}
          </div>

          {/* Scrollable Transactions List */}
          {showHousing &&
          transactions.filter(
            (txn) => txn.debit_amount && txn.category === "Housing",
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Subcategory</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(
                      (txn) => txn.debit_amount && txn.category === "Housing",
                    )
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">{txn.category}</td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.debit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showHousing && (
              <p className="text-center text-lg text-gray-500">
                No housing transactions found.
              </p>
            )
          )}
        </section>

        {/* Transportation Block */}
        {/* Transportation Transactions Block */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowTransportation(!showTransportation)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Transportation Transactions
            <span className="text-gray-500">
              {showTransportation ? "▲" : "▼"}
            </span>
            <span className="ml-4 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) =>
                    txn.debit_amount && txn.category === "Transportation",
                ).length
              }
              Transport
            </span>
          </h2>

          {/* Display Total Transportation */}
          <div className="bg-gray-900 p-3 text-yellow-400 font-semibold rounded-md">
            Total Transport: R
            {transactions
              .filter(
                (txn) => txn.debit_amount && txn.category === "Transportation",
              )
              .reduce((acc, txn) => acc + txn.debit_amount, 0)
              .toFixed(2)}
          </div>

          {/* Scrollable Transactions List */}
          {showTransportation &&
          transactions.filter(
            (txn) => txn.debit_amount && txn.category === "Transportation",
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Subcategory</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(
                      (txn) =>
                        txn.debit_amount && txn.category === "Transportation",
                    )
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">{txn.category}</td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.debit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showTransportation && (
              <p className="text-center text-lg text-gray-500">
                No transportation transactions found.
              </p>
            )
          )}
        </section>

        {/* Expenses Block */}
        {/* Expenses Transactions Block */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowExpenses(!showExpenses)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Expenses Transactions
            <span className="text-gray-500">{showExpenses ? "▲" : "▼"}</span>
            <span className="ml-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) => txn.debit_amount && txn.category === "Expenses",
                ).length
              }
              Expenses
            </span>
          </h2>

          {/* Display Total Expenses */}
          <div className="bg-gray-900 p-3 text-red-400 font-semibold rounded-md">
            Total Expenses: R
            {transactions
              .filter((txn) => txn.debit_amount && txn.category === "Expenses")
              .reduce((acc, txn) => acc + txn.debit_amount, 0)
              .toFixed(2)}
          </div>

          {/* Scrollable Transactions List */}
          {showExpenses &&
          transactions.filter(
            (txn) => txn.debit_amount && txn.category === "Expenses",
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Subcategory</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(
                      (txn) => txn.debit_amount && txn.category === "Expenses",
                    )
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">{txn.category}</td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.debit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showExpenses && (
              <p className="text-center text-lg text-gray-500">
                No expenses transactions found.
              </p>
            )
          )}
        </section>

        {/* Debt Block */}
        {/* Debt Transactions Block */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowDebt(!showDebt)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Debt Transactions
            <span className="text-gray-500">{showDebt ? "▲" : "▼"}</span>
            <span className="ml-4 bg-gray-500 text-white px-2 py-1 rounded text-sm">
              {
                transactions.filter(
                  (txn) => txn.debit_amount && txn.category === "Debt",
                ).length
              }
              Debts
            </span>
          </h2>

          {/* Display Total Debt */}
          <div className="bg-gray-900 p-3 text-gray-400 font-semibold rounded-md">
            Total Debt: R
            {transactions
              .filter((txn) => txn.debit_amount && txn.category === "Debt")
              .reduce((acc, txn) => acc + txn.debit_amount, 0)
              .toFixed(2)}
          </div>

          {/* Scrollable Transactions List */}
          {showDebt &&
          transactions.filter(
            (txn) => txn.debit_amount && txn.category === "Debt",
          ).length > 0 ? (
            <div className="overflow-y-auto max-h-64 bg-gray-800 rounded-md shadow-lg">
              <table className="min-w-full table-auto text-left text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter((txn) => txn.category === "Debt")
                    .map((txn, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{txn.date1}</td>
                        <td className="px-4 py-2">{txn.description}</td>
                        <td className="px-4 py-2">{txn.category}</td>
                        <td className="px-4 py-2">
                          {txn.subcategory || "Not Available"}
                        </td>
                        <td className="px-4 py-2">
                          R {txn.debit_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            showDebt && (
              <p className="text-center text-lg text-gray-500">
                No debt transactions found.
              </p>
            )
          )}
        </section>
      </div>
    </div>
  );
};

export default ViewReports;
