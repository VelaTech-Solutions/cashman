import React, { useState } from "react";

const CategorizeOverview3 = ({ transactions = [] }) => {
  const [show, setShow] = useState(true);
  if (!Array.isArray(transactions)) transactions = [];

  const totals = transactions.reduce((acc, txn) => {
    const category = txn.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + Math.abs(parseFloat(txn.debit_amount) || parseFloat(txn.credit_debit_amount) || 0);
    acc.Transactions = (acc.Transactions || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="p-2">
      <h2 onClick={() => setShow(!show)} className="text-sm font-semibold border-b border-gray-600 pb-1 cursor-pointer flex justify-between">
        Summary <span>{show ? "▲" : "▼"}</span>
      </h2>

      {show && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-center text-[10px]">
          {Object.entries(totals).map(([key, value]) => (
            <div key={key} className="bg-gray-800 p-1 rounded">
              <p>{key}</p>
              <p className="font-bold">R {value.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorizeOverview3;
