

// components/ArchivedData/Tables/ArchivedDataTable.js
// display the data nicely we have the
import React from "react";

const ArchivedDataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No archived data available.</div>;
  }

  return (
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">Source</th>
          <th className="px-4 py-2 text-left">Content</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border-t border-gray-700">
            <td className="px-4 py-2">{item.source || "—"}</td>
            <td className="px-4 py-2">
              {item.content || "No content available"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ArchivedDataTable;
