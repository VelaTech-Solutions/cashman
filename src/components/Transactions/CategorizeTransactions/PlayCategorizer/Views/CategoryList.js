import React from "react";

const CategoryList = ({ categories, categoryHits }) => (
  <div className="w-60 bg-gray-800 text-white p-3 rounded">
    <h3 className="text-lg font-semibold mb-2">📊 Categories</h3>
    <ul className="space-y-1 text-sm">
      {categories.map((cat) => {
        const hit = categoryHits[cat.name] || 0;
        return (
          <li key={cat.name} className="flex justify-between">
            <span>{cat.name}</span>
            <span className="text-green-400">{hit}</span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default CategoryList;
