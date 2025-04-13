// src/components/Transactions/EditTransactions/Tables/EditTableMissingCreditDebitAmounts.js
import React, { useState, useEffect } from "react";

// Firebase Imports
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { BaseTable, FirestoreHelper } from '../Utils/';

const EditTableMissingCreditDebitAmounts = ({ id }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const clientData = await FirestoreHelper.loadClientData(id);
      setTransactions(clientData.transactions || []);
    };

    loadData();
  }, [id]);

  // Only include transactions with 0 credit and 0 debit
  const filteredTransactions = transactions.filter(tx =>
    parseFloat(tx.credit_amount || 0) === 0 &&
    parseFloat(tx.debit_amount || 0) === 0
  );

  const handleRemoveZeros = async () => {
    const confirm = window.confirm("Are you sure you want to remove all transactions with missing credit and debit amounts?");
    if (!confirm) return;

    const updatedTransactions = transactions.filter(
      (tx) => !(
        parseFloat(tx.credit_amount || 0) === 0 &&
        parseFloat(tx.debit_amount || 0) === 0
      )
    );

    const transactionRef = doc(db, "clients", id);
    await updateDoc(transactionRef, {
      transactions: updatedTransactions,
    });

    setTransactions(updatedTransactions);
    alert("Transactions with missing credit and debit amounts have been removed.");
  };
  
  // Table headers
  const headers = (
    <tr>
      <th className="px-4 py-2 text-left w-[60px] border border-gray-700">Date1</th>
      <th className="px-4 py-2 text-left w-[60px] border border-gray-700">Date2</th>
      <th className="px-4 py-2 text-left w-[600px] border border-gray-700">Description</th>
      <th className="px-4 py-2 text-left w-[200px] border border-gray-700">Description2</th>
      <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Credit</th>
      <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Debit</th>
      <th className="px-4 py-2 text-left w-[80px] border-gray-700">Balance</th>
      <th className="px-4 py-2 text-left w-[80px] border border-gray-700">Actions</th>
    </tr>
  );

  const rows = filteredTransactions.map((tx, index) => (
    <tr key={tx.id || index} className="border-t border-gray-700">
      <td className="px-4 py-2 w-[60px] truncate overflow-hidden whitespace-nowrap border border-gray-700">{tx.date1 || "—"}</td>
      <td className="px-4 py-2 w-[60px] truncate overflow-hidden whitespace-nowrap border border-gray-700">{tx.date2 || "—"}</td>
      <td className="px-4 py-2 w-[600px] truncate overflow-hidden whitespace-nowrap text-ellipsis border border-gray-700">{tx.description || "—"}</td>
      <td className="px-4 py-2 w-[200px] truncate overflow-hidden whitespace-nowrap text-ellipsis border border-gray-700">{tx.description2 || "—"}</td>
      <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.credit_amount || 0).toFixed(2)}</td>
      <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.debit_amount || 0).toFixed(2)}</td>
      <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.balance_amount || 0).toFixed(2)}</td>
      <td className="px-4 py-2 border border-gray-700">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
          onClick={() => onEditClick(tx)} // Placeholder for edit action
        >
          Edit
        </button>
      </td>
    </tr>
  ));


  return (
    <div>
      <h1 className="text-sm font-semibold mb-4">Missing Credit & Debit Amount Transactions</h1>
      <button
        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 mb-4 rounded"
        onClick={handleRemoveZeros}
      >
        Remove All
      </button>
      <BaseTable headers={headers} rows={rows} />
      <p className="mt-4 text-gray-400">
        Missing credit & debit: {filteredTransactions.length}
      </p>
    </div>
  );
};

export default EditTableMissingCreditDebitAmounts;
