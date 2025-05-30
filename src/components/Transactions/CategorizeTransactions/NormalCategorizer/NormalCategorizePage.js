// src/components/Transactions/CategorizeTransactions/NormalCategorizePage.js

import React, { useState, useEffect } from "react";
// import Overview from "./OverViews/Overview";
import ContainerTables from "./Containers/ContainerTables";

const NormalCategorizer = ({ clientId }) => {
  return (
    <div className="bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>

      {/* <p className="text-sm text-gray-400 mb-4">
        This is a short description for the user. Select one transaction and run the
        <strong> Match All</strong> function or use the
        <strong> Match All Transactions </strong>
        button for the best results.
      </p> */}

      {/* Overview section */}
      {/* <Overview 
        transactions={transactions}
      /> */}

      {/* Action buttons */}
      {/* <CategorizeActions
        clientId={clientId}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      /> */}

      {/* Tables section */}
      <ContainerTables
        clientId={clientId}
      />
    </div>
  );
};

export default NormalCategorizer;
