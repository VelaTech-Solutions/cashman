import React, { useState } from "react";
import "styles/tailwind.css";

import SmartCategorizeTable from "./SmartCategorizeTable";
import SmartCategorizeActions from "./SmartCategorizeActions";

const SmartCategorizer = ({
  transactions,
  selectedTransactions,
  setSelectedTransactions,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  categories,
  filteredSubcategories,
  onMatchAll,
  onCategorize,
  onClear,
  search,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Smart Categorizer</h1>

        <p className="text-sm text-gray-400 mb-4">
          The Smart Categorizer uses fuzzy logic to help you automatically classify
          transactions that closely match known entries. You can adjust and
          review them below.
        </p>

        <SmartCategorizeActions
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

        <SmartCategorizeTable
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default SmartCategorizer;
