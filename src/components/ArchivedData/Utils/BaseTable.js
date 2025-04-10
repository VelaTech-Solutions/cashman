import React from "react";

const BaseTable = ({ headers, rows }) => {
  return (
    <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full table-fixed border border-gray-700 text-white">
        <thead className="bg-gray-800">
          {headers}
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default BaseTable;
