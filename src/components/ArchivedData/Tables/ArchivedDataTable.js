

// components/ArchivedData/Tables/ArchivedDataTable.js
// display the data nicely we have the
import React from "react";

const ArchivedDataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No archived data available.</div>;
  }

  return (
<div className="max-h-[400px] overflow-y-auto rounded border border-gray-700">
  <table className="min-w-full table-auto border-collapse">
    <thead className="sticky top-0 bg-gray-800 z-10">
      <tr>
        <th className="px-4 py-2 text-left border-b border-gray-600">Source</th>
        <th className="px-4 py-2 text-left border-b border-gray-600">Content</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => (
        <tr key={index} className="border-t border-gray-700 hover:bg-gray-900">
          <td className="px-4 py-2">{item.source || "—"}</td>
          <td className="px-4 py-2">
            {item.content || "No content available"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default ArchivedDataTable;
