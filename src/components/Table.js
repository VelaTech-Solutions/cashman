import React from "react";

const Table = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 bg-white text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
};

export default Table;
