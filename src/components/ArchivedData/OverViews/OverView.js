import React from "react";

const OverView = ({ data = [] }) => {
  if (!Array.isArray(data)) data = [];

  // Helper functions
  
  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow w-full">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>Archived Data: <strong>{data.length}</strong></div>

      </div>
    </div>
  );
};

export default OverView;
