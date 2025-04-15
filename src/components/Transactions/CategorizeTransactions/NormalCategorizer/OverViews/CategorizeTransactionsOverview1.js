import React, { useState, useEffect } from "react";
import { LoadClientData, Loader } from 'components/Common';

const CategorizeTransactionsOverview1 = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("Client not found.");
        } else {
          setClientData(data);
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
      } catch (err) {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    loadData(); // ✅ Call the async loader
  }, [clientId]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  const categorized = {
    Income: [],
    Savings: [],
    Housing: [],
    Transportation: [],
    Expenses: [],
    Debt: [],
    Uncategorized: [],
  };

  transactions.forEach((txn) => {
    const category = txn.category || "Uncategorized";
    if (categorized[category]) {
      categorized[category].push(txn);
    } else {
      categorized["Uncategorized"].push(txn);
    }
  });

  const calculateTotal = (category) =>
    categorized[category]
      .reduce(
        (acc, txn) =>
          acc + Math.abs(parseFloat(txn.debit_amount) || parseFloat(txn.credit_debit_amount) || 0),
        0
      )
      .toFixed(2);

  return (
    <section className="space-y-2">
      <h2
        onClick={() => setShowSummary(!showSummary)}
        className="text-xl font-bold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
      >
        Financial Summary
        <span className="text-gray-400 text-sm">{showSummary ? "▲" : "▼"}</span>
      </h2>

      {showSummary && (
        <div className="text-sm text-gray-100 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-1">
            <p>Total Income: R {calculateTotal("Income")}</p>
            <p>Total Savings: R {calculateTotal("Savings")}</p>
            <p>Total Housing: R {calculateTotal("Housing")}</p>
          </div>
          <div className="space-y-1">
            <p>Total Transportation: R {calculateTotal("Transportation")}</p>
            <p>Total Expenses: R {calculateTotal("Expenses")}</p>
            <p>Total Debt: R {calculateTotal("Debt")}</p>
          </div>
          <div className="space-y-1">
            <p>Total Transactions: {transactions.length}</p>
            <p>Categorized Transactions: {transactions.length - categorized["Uncategorized"].length}</p>
            <p>Uncategorized Transactions: {categorized["Uncategorized"].length}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorizeTransactionsOverview1;
