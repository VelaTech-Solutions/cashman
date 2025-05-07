import React from "react";

const Table = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-sm">No archived data available.</div>;
  }
  const rawItems = data.filter(item => item.source || item.content);
  const extractedItems = data.filter(item => item.date1 || item.date2 || item.description);
  return (
    <div className="space-y-10">
      {/* Extracted Data */}
      <div>
        <h2 className="text-lg font-semibold text-lime-400 mb-3">📄 Extracted Data</h2>
        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-gray-700">
          <table className="min-w-full table-auto border-collapse text-sm text-left text-white">
            <thead className="sticky top-0 bg-gray-800 z-10 text-gray-300">
              <tr>
                <th className="px-4 py-2 border-b border-gray-600">Date</th>
                <th className="px-4 py-2 border-b border-gray-600">Description</th>
                <th className="px-4 py-2 border-b border-gray-600">Credit</th>
                <th className="px-4 py-2 border-b border-gray-600">Debit</th>
                <th className="px-4 py-2 border-b border-gray-600">Balance</th>
                <th className="px-4 py-2 border-b border-gray-600">Fees</th>
                <th className="px-4 py-2 border-b border-gray-600">Original</th>
              </tr>
            </thead>
            <tbody>
              {extractedItems.map((item, index) => (
                <tr key={`txn-${index}`} className="border-t border-gray-700 hover:bg-gray-900">
                  <td className="px-4 py-2">{item.date1 || item.date2 || <span className="text-gray-500">—</span>}</td>
                  <td className="px-4 py-2">{item.description || <span className="text-gray-500">—</span>}</td>
                  <td className="px-4 py-2">{item.credit_amount || "0.00"}</td>
                  <td className="px-4 py-2">{item.debit_amount || "0.00"}</td>
                  <td className="px-4 py-2">{item.balance_amount || "0.00"}</td>
                  <td className="px-4 py-2">{item.fees_amount || "0.00"}</td>
                  <td className="px-4 py-2 text-gray-400 italic max-w-xs truncate">{item.original}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {rawItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-lime-400 mb-3">🗃️ Archived Raw Content</h2>
          <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-700">
            <table className="min-w-full table-auto border-collapse text-sm text-left text-white">
              <thead className="sticky top-0 bg-gray-800 z-10 text-gray-300">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-600">Source</th>
                  <th className="px-4 py-2 border-b border-gray-600">Content</th>
                </tr>
              </thead>
              <tbody>
                {rawItems.map((item, index) => (
                  <tr key={`raw-${index}`} className="border-t border-gray-700 hover:bg-gray-900">
                    <td className="px-4 py-2">{item.source || "—"}</td>
                    <td className="px-4 py-2 text-gray-300">{item.content || "No content available"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
