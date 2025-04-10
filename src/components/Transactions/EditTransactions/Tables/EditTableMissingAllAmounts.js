// src/components/Transactions/EditTransactions/Tables/EditTableZeroAmounts.js
import React, { useState, useEffect } from "react";

// Firebase Imports
import { doc, updateDoc, getDoc  } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { BaseTable, FirestoreHelper } from '../Utils/';

const EditTableMissingAllAmounts = ({ id }) => {
  const [transactions, setTransactions] = useState([]);
  
  // Function to load client data and set transactions
  useEffect(() => {
    const loadData = async () => {
      const clientData = await FirestoreHelper.loadClientData(id); // Load client data with FirestoreHelper
      setTransactions(clientData.transactions || []);
    };
    
    loadData();
  }, [id]);

  // Filter transactions with all zero amounts in debit, credit, and balance
  const filteredTransactions = transactions.filter(tx =>
    parseFloat(tx.debit_amount || 0) === 0 &&
    parseFloat(tx.credit_amount || 0) === 0 &&
    parseFloat(tx.balance_amount || 0) === 0
  );

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

  // Table rows for displaying zero amount transactions
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
          onClick={() => onEditClick(tx)} // Edit functionality (you'll need to implement it)
        >
          Edit
        </button>
      </td>
    </tr>
  ));

  // Remove all zero amounts from the transactions on click

  const handleRemoveZeros = async () => {
    const confirm = window.confirm("Are you sure you want to remove all zero amount transactions?");
    if (!confirm) return;
  
    // Split transactions into removed and remaining
    const removed = transactions.filter(tx =>
      parseFloat(tx.debit_amount || 0) === 0 &&
      parseFloat(tx.credit_amount || 0) === 0 &&
      parseFloat(tx.balance_amount || 0) === 0
    );
  
    const remaining = transactions.filter(tx =>
      !(
        parseFloat(tx.debit_amount || 0) === 0 &&
        parseFloat(tx.credit_amount || 0) === 0 &&
        parseFloat(tx.balance_amount || 0) === 0
      )
    );
  
    const transactionRef = doc(db, "clients", id);
  
    // Format removed lines for archive
    const archiveEntries = removed.map((tx) => ({
      content: `${tx.description || ""} ${tx.description2 || ""}`.trim(),
      source: "EditTableMissingAllAmounts",
    }));
  
    // Get the current archive array (if it exists)
    const docSnap = await getDoc(transactionRef);
    const currentArchive = docSnap.exists() ? docSnap.data().archive || [] : [];
  
    // Append new entries
    await updateDoc(transactionRef, {
      transactions: remaining,
      archive: [...currentArchive, ...archiveEntries]
    });
  
    setTransactions(remaining);
    alert("All zero amount transactions have been removed and archived.");
  };
  

  return (
    <div>
      <h1 className="text-sm font-semibold mb-4">Transactions</h1>
      <button
        className="bg-red-600 hover:bg-red-600 text-white py-0 px-1 mb-4 rounded"
        onClick={handleRemoveZeros}
      >
        <span className="text-sm">Remove All</span>
      </button>
      <BaseTable headers={headers} rows={rows} />
      <p className="mt-4 text-gray-400">
        Zero amount transactions: {filteredTransactions.length}
      </p>
    </div>
  );
};

export default EditTableMissingAllAmounts;
