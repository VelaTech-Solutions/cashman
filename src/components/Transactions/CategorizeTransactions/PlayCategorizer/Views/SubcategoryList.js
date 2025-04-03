import React from "react";

const SubcategoryList = ({ subcategoryMode, subcategoryTargets, subcategoryHits }) => (
  <div className="w-60 bg-gray-800 text-white p-3 rounded">
    <h3 className="text-lg font-semibold mb-2">📂 Subcategories</h3>
    <ul className="space-y-1 text-sm">
      {subcategoryMode &&
        (subcategoryTargets || []).map((sub) => (
          <li key={sub.name} className="flex justify-between">
            <span>{sub.name}</span>
            <span className="text-yellow-300">
              {subcategoryHits[sub.name] || 0}
            </span>
          </li>
        ))}
    </ul>
  </div>
);

export default SubcategoryList;
