// src/components/Transactions/CategorizeTransactions/NormalCategorizePage.js

import React from "react";
import CategorizeActions from "./Actions/CategorizeActions";
import ContainerTables from "./Containers/ContainerTables";

const NormalCategorizer = ({
  transactions,
  setTransactions,
  selectedTransactions,
  setSelectedTransactions,
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  categories,
  filteredSubcategories,
  onMatchAll,
  onCategorize,
  onClear
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>

      <p className="text-sm text-gray-400 mb-4">
        This is a short description for the user. Select one transaction and run the
        <strong> Match All</strong> function or use the
        <strong> Match All Transactions </strong>
        button for the best results.
      </p>

      <CategorizeActions
        search={setSearchQuery}
        category={category}
        setCategory={setCategory}
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        categories={categories}
        filteredSubcategories={filteredSubcategories}
        onMatchAll={onMatchAll}
        onCategorize={onCategorize}
        onClear={onClear}
      />

      <ContainerTables
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      />
    </div>
  );
};

export default NormalCategorizer;
