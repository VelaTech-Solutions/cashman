// src/components/Transactions/CategorizeTransactions/NormalCategorizePage.js

import React from "react";

import CategorizeActions from "./Actions/CategorizeActions";
import CategorizeTransactionsOverview1 from "./OverViews/CategorizeTransactionsOverview1";
import ContainerTables from "./Containers/ContainerTables";

const NormalCategorizer = ({ clientId }) => {

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>

      <p className="text-sm text-gray-400 mb-4">
        This is a short description for the user. Select one transaction and run the
        <strong> Match All</strong> function or use the
        <strong> Match All Transactions </strong>
        button for the best results.
      </p>

      <CategorizeTransactionsOverview1 clientId={clientId} />

      <CategorizeActions clientId={clientId}/>

      <ContainerTables clientId={clientId}/>
      
    </div>
  );
};

export default NormalCategorizer;
