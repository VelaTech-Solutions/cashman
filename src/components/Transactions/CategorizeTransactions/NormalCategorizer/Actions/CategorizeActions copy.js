// src/components/Transactions/CategorizeTransactions/NormalCategorizer/Actions/CategorizeActions.js
import React, { useState } from "react";


// Components Import

import { SaveCatTrans } from "../Utils";


const CategorizeActions = ({
  search,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  categories,
  filteredSubcategories,
  onMatchAll,
  onCategorize,
  onClear,
}) => {
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingCategorize, setLoadingCategorize] = useState(false);
  const [loadingClear, setLoadingClear] = useState(false);

  const handleMatchAll = async () => {
    setLoadingMatch(true);
    await onMatchAll();
    setLoadingMatch(false);
  };

  
  const handleCategorize = async () => {
    setLoadingCategorize(true);
    await onCategorize();
    setLoadingCategorize(false);
  };

  const handleClear = async () => {
    setLoadingClear(true);
    await onClear();
    setLoadingClear(false);
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-2">
      <input
        type="text"
        placeholder="🔍 Search..."
        onChange={(e) => search(e.target.value)}
        className="flex-1 min-w-[150px] p-2 text-sm rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
        <option value="">Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
        <option value="">Subcategory</option>
        {filteredSubcategories.map((sub) => (
          <option key={sub.id} value={sub.name}>{sub.name}</option>
        ))}
      </select>

      <button
        onClick={handleMatchAll}
        disabled={loadingMatch}
        className="bg-green-500 hover:bg-green-600 text-white p-2 text-xs rounded flex items-center justify-center"
      >
        {loadingMatch ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "✅ Match All"}
      </button>

      <button
        onClick={handleCategorize}
        disabled={loadingCategorize}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs rounded flex items-center justify-center"
      >
        {loadingCategorize ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "📂 Categorize"}
      </button>

      <button
        onClick={handleClear}
        disabled={loadingClear}
        className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs rounded flex items-center justify-center"
      >
        {loadingClear ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : "❌ Clear"}
      </button>
    </div>
  );
};

export default CategorizeActions;
