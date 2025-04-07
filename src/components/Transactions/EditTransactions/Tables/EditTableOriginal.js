// src/components/Transactions/EditTransactions/Tables/EditTableOriginal.js
import React, { useEffect, useState } from "react";
import { LoadClientData } from "components/Common";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import BaseTable from "../Utils/BaseTable";

const EditTableOriginal = ({ id }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  // Load client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
        setTransactions(data.transactions || []);
      } catch (err) {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const handleEditClick = (index) => setEditingIndex(index);

  const handleInputChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
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

  const handleSaveClick = () => {
    setEditingIndex(null);
    // Optional: Save to Firebase here
  };

  if (loading) return <p className="text-gray-400">Loading transactions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!transactions.length) return <p className="text-gray-400">No transactions found.</p>;

  const headers = (
    <tr>
      {["Date1", "Date2", "Description", "Description2", "Credit", "Debit", "Balance", "Actions"].map((h, i) => (
        <th key={i} className="px-4 py-2 text-left border border-gray-700">{h}</th>
      ))}
    </tr>
  );

  const rows = transactions.flatMap((tx, index) => {
    const isEditing = index === editingIndex;
    const cells = isEditing ? (
      <>
        <td><input className="w-full" value={tx.date1} onChange={(e) => handleInputChange(index, "date1", e.target.value)} /></td>
        <td><input className="w-full" value={tx.date2} onChange={(e) => handleInputChange(index, "date2", e.target.value)} /></td>
        <td><input className="w-full" value={tx.description} onChange={(e) => handleInputChange(index, "description", e.target.value)} /></td>
        <td><input className="w-full" value={tx.description2} onChange={(e) => handleInputChange(index, "description2", e.target.value)} /></td>
        <td><input className="w-full" value={tx.credit_amount} onChange={(e) => handleInputChange(index, "credit_amount", e.target.value)} /></td>
        <td><input className="w-full" value={tx.debit_amount} onChange={(e) => handleInputChange(index, "debit_amount", e.target.value)} /></td>
        <td><input className="w-full" value={tx.balance_amount} onChange={(e) => handleInputChange(index, "balance_amount", e.target.value)} /></td>
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
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded" onClick={() => handleEditClick(index)}>Edit</button>
        </td>
      </>
    );

    return [
      <tr key={tx.id || index}>{cells}</tr>,
      <tr key={`insert-${index}`}>
        <td colSpan={8} className="text-center py-1">
          <button className="text-green-600 hover:text-green-800 text-sm" onClick={() => handleInsertClick(index)}>+ Add new line</button>
        </td>
      </tr>,
    ];
  });

  return (
    <div>
      <BaseTable headers={headers} rows={rows} />
      <p className="mt-4 text-gray-400">Transactions: {transactions.length}</p>
    </div>
  );
};

export default EditTableOriginal;
