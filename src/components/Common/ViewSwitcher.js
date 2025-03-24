// components/Common/ViewSwitcher.js
import React from "react";

const ViewSwitcher = ({ views, activeViewKey, setActiveViewKey }) => {
  return (
    <div className="flex space-x-4 mb-6">
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => setActiveViewKey(view.key)}
          className={`px-4 py-2 rounded ${
            activeViewKey === view.key
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
