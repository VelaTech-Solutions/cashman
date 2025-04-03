import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

const CategorySettingsTransactions = () => {
  const [bankName, setBankName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bankOptions = [
    "Absa Bank",
    "Capitec Bank",
    "Fnb Bank",
    "Ned Bank",
    "Standard Bank",
    "Tyme Bank",
  ];

  const fetchTransactions = async (selectedBank) => {
    if (!selectedBank) return;

    setLoading(true);
    setTransactions([]);
    try {
      const ref = collection(db, `transaction_database/${selectedBank}/transactions`);
      const snapshot = await getDocs(ref);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(results);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!bankName || !id) return;
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, `transaction_database/${bankName}/transactions/${id}`));
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!bankName) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ALL transactions for ${bankName}?`
    );
    if (!confirmDelete) return;

    try {
      const collectionRef = collection(db, `transaction_database/${bankName}/transactions`);
      const snapshot = await getDocs(collectionRef);

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      alert(`All transactions for ${bankName} have been deleted.`);
      setTransactions([]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete transactions.");
    }
  };

  useEffect(() => {
    if (bankName) {
      fetchTransactions(bankName);
    }
  }, [bankName]);

  return (
    <div className="p-4 text-white">
      <div className="mb-4">
        <label className="block mb-2">Select Bank</label>
        <select
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="">-- Choose a bank --</option>
          {bankOptions.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </div>

      {bankName && (
        <button
          onClick={handleBulkDelete}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-lg transition-all"
        >
          🗑️ Bulk Delete All Transactions for {bankName}
        </button>
      )}

      {loading && <p className="text-gray-400">Loading transactions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700 mt-4">
            <thead className="bg-gray-700">
              <tr>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Subcategory</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Created At</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800">
                  <td className="border px-4 py-2">{tx.category || "N/A"}</td>
                  <td className="border px-4 py-2">{tx.subcategory || "N/A"}</td>
                  <td className="border px-4 py-2">{tx.description || "N/A"}</td>
                  <td className="border px-4 py-2">{tx.createdAt || "N/A"}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length === 0 && !loading && bankName && (
        <p className="text-gray-400 mt-4">No transactions found for {bankName}</p>
      )}
    </div>
  );
};

export default CategorySettingsTransactions;
