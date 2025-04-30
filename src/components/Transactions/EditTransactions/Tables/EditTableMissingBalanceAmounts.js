// src/components/Transactions/EditTransactions/Tables/EditTableZeroAmounts.js
import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { BaseTable, FirestoreHelper } from "../Utils/";

const EditTableMissingBalanceAmounts = ({ clientId }) => {
  const [transactions, setTransactions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const clientData = await FirestoreHelper.loadClientData(clientId);
      setTransactions(clientData.transactions || []);
    };
    loadData();
  }, [clientId]);

  const filteredTransactions = transactions.filter(
    (tx) => parseFloat(tx.balance_amount || 0) === 0
  );

  const handleInputChange = (field, value) => {
    setEditedTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedTransaction(filteredTransactions[index]);
  };

  const handleSaveClick = async () => {
    const updated = [...transactions];
    const originalTx = filteredTransactions[editingIndex];

    // Find index in the full transactions list
    const fullIndex = transactions.findIndex(
      (tx) => tx.id === originalTx.id
    );

    if (fullIndex !== -1) {
      updated[fullIndex] = editedTransaction;
      const transactionRef = doc(db, "clients", clientId);
      await updateDoc(transactionRef, { transactions: updated });
      setTransactions(updated);
      setEditingIndex(null);
      setEditedTransaction(null);
    }
  };

  const handleInsertClick = (index) => {
    const newTx = {
      date1: "",
      date2: "",
      description: "",
      description2: "",
      credit_amount: 0,
      debit_amount: 0,
      balance_amount: 0,
    };
    const updated = [...transactions];
    updated.splice(index + 1, 0, newTx);
    setTransactions(updated);
  };

  const handleDeleteClick = async (index) => {
    const updated = [...transactions];
    const removed = updated.splice(index, 1); // remove and store the deleted transaction
    setTransactions(updated);
  
    try {
      const transactionRef = doc(db, "clients", clientId);
  
      // Format removed line for archive
      const archiveEntries = removed.map((tx) => ({
        content: `${tx.description || ""} ${tx.description2 || ""} ${tx.credit_amount || ""} ${tx.debit_amount || ""} ${tx.balance_amount || ""}`.trim(),
        source: "EditTableOriginal",
      }));
  
      // Get current archive (if exists)
      const docSnap = await getDoc(transactionRef);
      const currentArchive = docSnap.exists() ? docSnap.data().archive || [] : [];
  
      // Save updated transactions + updated archive
      await updateDoc(transactionRef, {
        transactions: updated,
        archive: [...currentArchive, ...archiveEntries],
      });
  
      console.log("Transaction deleted and archived successfully.");
    } catch (err) {
      console.error("Failed to delete and archive transaction:", err);
    }
  };

  const handleRemoveZeros = async () => {
    const confirm = window.confirm("Remove all zero balance transactions?");
    if (!confirm) return;

    const removed = transactions.filter(
      (tx) => parseFloat(tx.balance_amount || 0) === 0
    );
    const remaining = transactions.filter(
      (tx) => parseFloat(tx.balance_amount || 0) !== 0
    );

    const archiveEntries = removed.map((tx) => ({
      content: `${tx.description || ""} ${tx.description2 || ""}`.trim(),
      source: "EditTableMissingAllAmounts",
    }));

    const transactionRef = doc(db, "clients", clientId);
    const docSnap = await getDoc(transactionRef);
    const currentArchive = docSnap.exists() ? docSnap.data().archive || [] : [];

    await updateDoc(transactionRef, {
      transactions: remaining,
      archive: [...currentArchive, ...archiveEntries],
    });

    setTransactions(remaining);
    alert("Removed and archived all zero balance transactions.");
  };

  const headers = (
    <tr>
      <th className="px-2 py-2 w-[20px] border border-gray-700">+</th>
      <th className="px-2 py-2 w-[20px] border border-gray-700">X</th>
      <th className="px-4 py-2 w-[60px] border border-gray-700">Date1</th>
      <th className="px-4 py-2 w-[60px] border border-gray-700">Date2</th>
      <th className="px-4 py-2 w-[600px] border border-gray-700">Description</th>
      <th className="px-4 py-2 w-[200px] border border-gray-700">Description2</th>
      <th className="px-4 py-2 w-[80px] border border-gray-700">Credit</th>
      <th className="px-4 py-2 w-[80px] border border-gray-700">Debit</th>
      <th className="px-4 py-2 w-[80px] border border-gray-700">Balance</th>
      <th className="px-4 py-2 w-[80px] border border-gray-700">Actions</th>
    </tr>
  );

  const rows = filteredTransactions.map((tx, index) => {
    const isEditing = editingIndex === index;

    return (
      <tr key={tx.id || index} className="border-t border-gray-700">
        <td className="px-2 py-2 border border-gray-700">
          <button className="text-green-500" onClick={() => handleInsertClick(index)}>+</button>
        </td>
        <td className="px-2 py-2 border border-gray-700">
          <button className="text-red-500" onClick={() => handleDeleteClick(index)}>X</button>
        </td>


        {isEditing ? (
          <>
            <td><input className="w-full text-black" value={editedTransaction.date1} onChange={(e) => handleInputChange("date1", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.date2} onChange={(e) => handleInputChange("date2", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.description} onChange={(e) => handleInputChange("description", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.description2} onChange={(e) => handleInputChange("description2", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.credit_amount} onChange={(e) => handleInputChange("credit_amount", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.debit_amount} onChange={(e) => handleInputChange("debit_amount", e.target.value)} /></td>
            <td><input className="w-full text-black" value={editedTransaction.balance_amount} onChange={(e) => handleInputChange("balance_amount", e.target.value)} /></td>
            <td>
              <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleSaveClick}>Save</button>
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-2 border border-gray-700">{tx.date1 || "—"}</td>
            <td className="px-4 py-2 border border-gray-700">{tx.date2 || "—"}</td>
            <td className="px-4 py-2 border border-gray-700">{tx.description || "—"}</td>
            <td className="px-4 py-2 border border-gray-700">{tx.description2 || "—"}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.credit_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.debit_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">R {parseFloat(tx.balance_amount || 0).toFixed(2)}</td>
            <td className="px-4 py-2 border border-gray-700">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                onClick={() => handleEditClick(index)}
              >
                Edit
              </button>
            </td>
          </>
        )}
      </tr>
    );
  });

  return (
    <div>
      <h1 className="text-sm font-semibold mb-4">Zero Balance Transactions</h1>
      <button
        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded mb-4"
        onClick={handleRemoveZeros}
      >
        Remove All
      </button>
      <BaseTable headers={headers} rows={rows} />
      <p className="mt-4 text-gray-400">
        Total zero balance transactions: {filteredTransactions.length}
      </p>
    </div>
  );
};

export default EditTableMissingBalanceAmounts;
