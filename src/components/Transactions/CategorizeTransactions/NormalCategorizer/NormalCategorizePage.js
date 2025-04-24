// src/components/Transactions/CategorizeTransactions/NormalCategorizePage.js

import React, { useState, useEffect } from "react";
import { LoadClientData, Loader } from "components/Common";

import CategorizeActions from "./Actions/CategorizeActions";
import CategorizeTransactionsOverview1 from "./OverViews/CategorizeTransactionsOverview1";
import ContainerTables from "./Containers/ContainerTables";

const NormalCategorizer = ({ clientId }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  // Load client data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (data) {
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
      } catch (error) {
        console.error("Failed to load client data", error);
      }
    };
    loadData();
  }, [clientId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>

      <p className="text-sm text-gray-400 mb-4">
        This is a short description for the user. Select one transaction and run the
        <strong> Match All</strong> function or use the
        <strong> Match All Transactions </strong>
        button for the best results.
      </p>

      {/* Overview section */}
      <CategorizeTransactionsOverview1 clientId={clientId} />

      {/* Action buttons */}
      {/* <CategorizeActions
        clientId={clientId}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      /> */}

      {/* Tables section */}
      <ContainerTables
        clientId={clientId}
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      />
    </div>
  );
};

export default NormalCategorizer;
