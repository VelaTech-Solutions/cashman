import React, { useEffect, useState } from "react";

// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { LoadClientData, Loader } from "components/Common";
import { BaseTable, FirestoreHelper } from '../Utils/';

const EditTableOriginal = ({ id }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const clientData = await FirestoreHelper.loadClientData(id); // new helper
      if (!clientData) {
        setError("Client not found.");
        setLoading(false);
        return;
      }
      setClientData(clientData);
      setTransactions(clientData.transactions || []);
      setLoading(false); // ✅ Don't forget to set loading to false once done
    };
  
    loadData();
  }, [id]);
  

  const handleEditClick = (index) => setEditingIndex(index);
  // const handleSaveClick = () => setEditingIndex(null);

  const handleInputChange = async (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  
    const updatedTransaction = updated[index];
  
    try {
      const clientRef = doc(db, "clients", id);
      await updateDoc(clientRef, {
        transactions: updated,
      });
      console.log("Change saved instantly to Firestore.");
    } catch (err) {
      console.error("Failed to save change to Firestore:", err);
    }
  };
  
  const handleSaveClick = async () => {
    setEditingIndex(null);
  
    if (!id) return;
  
    try {
      const clientRef = doc(db, "clients", id);
      await updateDoc(clientRef, { transactions });
      console.log("Transactions saved successfully.");
    } catch (error) {
      console.error("Error saving transactions:", error);
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
      const transactionRef = doc(db, "clients", id);
  
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
    
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

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

  const isInvalidDate = (date) => {
    return !date || date === "None" || date === "null" || date === "(null)";
  };
  const invalidTransactions = transactions.filter(
    tx => isInvalidDate(tx.date1) && isInvalidDate(tx.date2)
  );

  // Filter out invalid transactions for display
  const filteredTransactions = transactions.filter(
    tx => !isInvalidDate(tx.date1) || !isInvalidDate(tx.date2)
  );
  // Display the transactions in the table
  const rows = filteredTransactions.map((tx, index) => {
    const isEditing = index === editingIndex;

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
            <td><input className="w-full text-black" value={tx.date1} onChange={(e) => handleInputChange(index, "date1", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.date2} onChange={(e) => handleInputChange(index, "date2", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.description} onChange={(e) => handleInputChange(index, "description", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.description2} onChange={(e) => handleInputChange(index, "description2", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.credit_amount} onChange={(e) => handleInputChange(index, "credit_amount", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.debit_amount} onChange={(e) => handleInputChange(index, "debit_amount", e.target.value)} /></td>
            <td><input className="w-full text-black" value={tx.balance_amount} onChange={(e) => handleInputChange(index, "balance_amount", e.target.value)} /></td>
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
              <button className="bg-blue-500 hover:bg-blue-600 text-black py-1 px-2 rounded" onClick={() => handleEditClick(index)}>Edit</button>
            </td>
          </>
        )}
      </tr>
    );
  });

  return (
    <div>
      <h1 className="text-sm font-semibold mb-4">Transactions</h1>
      <BaseTable headers={headers} rows={rows} />
      <p className="mt-4 text-gray-400">Transactions: {filteredTransactions.length}</p>
    </div>
  );
};

export default EditTableOriginal;
