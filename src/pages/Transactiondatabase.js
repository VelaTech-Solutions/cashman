import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Component Imports
import LoadClientData from "components/LoadClientData"; // Reusable client data loader
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

// Firebase Imports
import { db } from "../firebase/firebase"; // Ensure firebase.js exports 'db'
import { doc, getDocs, collection, deleteDoc } from "firebase/firestore";

const links = [{ path: "javascript:void(0)", label: "Back", icon: "ph-home" }];

const TransactionDatabase = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Use navigate for dynamic "Back" link
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching client data:", err.message);
        setError("Failed to fetch client data.");
      }
    };

    fetchClientData();
  }, [id]);

  // Fetch transactions based on client data
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!clientData?.bankName) return;

      try {
        const bankName = clientData.bankName;
        const transactionsRef = collection(
          db,
          `transaction_database/${bankName}/transactions`,
        );
        const querySnapshot = await getDocs(transactionsRef);

        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(transactionsData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [clientData]);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleDelete = async (transactionId, bankName) => {
    try {
      if (!transactionId) {
        console.error("Error: Transaction ID is missing.");
        alert("Error: Transaction ID is missing.");
        return;
      }

      if (!bankName) {
        console.error("Error: Bank name is missing.");
        alert("Error: Bank name is missing.");
        return;
      }

      console.log(
        `DEBUG: Attempting to delete transaction at path: transaction_database/${bankName}/transactions/${transactionId}`,
      );

      // Reference to the transaction document
      const transactionDocRef = doc(
        db,
        "transaction_database",
        bankName,
        "transactions",
        transactionId,
      );

      // Delete the transaction
      await deleteDoc(transactionDocRef);
      console.log(`DEBUG: Transaction ${transactionId} deleted successfully.`);

      // Update UI by filtering out the deleted transaction
      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== transactionId,
        ),
      );

      alert("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      alert("Failed to delete transaction. Check console logs.");
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Transaction Database" links={links} />

      {/* Main content */}
      <div className="flex-1 p-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
            Transaction Database - {clientData?.bankName || "Unknown Bank"}
          </h2>
          <p className="text-lg text-gray-400">
            Below is the list of all transactions fetched from the database.
          </p>
        </section>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="border border-gray-600 px-4 py-2">Category</th>
                <th className="border border-gray-600 px-4 py-2">
                  Subcategory
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  Description
                </th>
                <th className="border border-gray-600 px-4 py-2">Created At</th>
                <th className="border border-gray-600 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-800">
                  <td className="border border-gray-600 px-4 py-2">
                    {transaction.category || "N/A"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {transaction.subcategory || "N/A"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {transaction.description || "N/A"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    {transaction.createdAt || "N/A"}
                  </td>
                  <td className="border border-gray-600 px-4 py-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => handleEdit(transaction.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
                      onClick={() =>
                        handleDelete(transaction.id, clientData?.bankName)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Handlers
  const handleEdit = (id) => {
    console.log(`Editing transaction with ID: ${id}`);
  };
};

export default TransactionDatabase;
