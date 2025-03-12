import React from "react";

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
  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-2">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search..."
        onChange={(e) => search(e.target.value)}
        className="flex-1 min-w-[150px] p-2 text-sm rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
      />

      {/* Dropdowns */}
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

      {/* Buttons */}
      <button onClick={onMatchAll} className="bg-green-500 hover:bg-green-600 text-white p-2 text-xs rounded">
        ✅ Match All
      </button>
      <button onClick={onCategorize} className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs rounded">
        📂 Categorize
      </button>
      <button onClick={onClear} className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs rounded">
        ❌ Clear
      </button>
    </div>
  );
};

export default CategorizeActions;
