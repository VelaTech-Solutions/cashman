// components/Categorize/SmartCategorizeActions.js
import React from "react";

const SmartCategorizeActions = ({ onSmartMatch }) => {
  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md flex items-center justify-between">
      <button
        onClick={onSmartMatch}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
      >
        🤖 Smart Match
      </button>
    </div>
  );
};

export default SmartCategorizeActions;