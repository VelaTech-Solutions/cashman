import React, { useState, useEffect } from "react";
import { loadCategories, loadSubcategories } from "components/Common";
import { saveCategorizedTransaction } from "../Utils";

const CategorizeActions = ({ clientId, selectedTransactions, setSelectedTransactions }) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Load categories once on mount
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!category) return;
      const subs = await loadSubcategories(category);
      setSubcategories(subs);
    };
    fetchSubs();
  }, [category]);

  const handleCategorize = async () => {
    if (!category || !subcategory || selectedTransactions.length === 0) return;
    console.log('Categorizing transactions:', selectedTransactions);

    await saveCategorizedTransaction(selectedTransactions, category, subcategory);
    setSelectedTransactions([]);  // Clear selected transactions after categorization
    console.log("Categorized transactions:", selectedTransactions);
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-2">
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
        <option value="">Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
        <option value="">Subcategory</option>
        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.name}>{sub.name}</option>
        ))}
      </select>

      <button
        onClick={handleCategorize}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs rounded"
      >
        📂 Categorize
      </button>

      <button
        onClick={() => setSelectedTransactions([])}
        className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs rounded"
      >
        ❌ Clear
      </button>
    </div>
  );
};

export default CategorizeActions;

// 
