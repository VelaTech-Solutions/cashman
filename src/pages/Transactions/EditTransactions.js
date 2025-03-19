import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadClientData from "components/LoadClientData";
import Sidebar from "components/Sidebar";
import Table from "components/Table";
import Loader from "components/Loader";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import "styles/tailwind.css";

// Utility function for formatting currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "R 0.00";
  return `R ${parseFloat(value || 0).toFixed(2)}`;
};

// Transaction validation function
const validateTransaction = (transaction) => {
  const errors = {};
  
  // Validate numeric fields
  ['credit_amount', 'debit_amount', 'balance_amount', 'credit_debit_amount'].forEach(field => {
    if (transaction[field] && isNaN(parseFloat(transaction[field]))) {
      errors[field] = `${field.replace('_', ' ')} must be a number`;
    }
  });
  
  return errors;
};

// Transaction row component
const TransactionRow = ({ transaction, index, isEditing, onEdit, onSave, onChange, onCancel, validationErrors = {} }) => {
  if (isEditing) {
    return (
      <tr className="border-b border-gray-700">
        {["date1", "date2", "description", "credit_debit_amount", "credit_amount", "debit_amount", "balance_amount"].map(
          (field) => (
            <td key={field} className="px-4 py-2">
              <input
                type={field.includes("amount") ? "number" : "text"}
                value={transaction[field] || ""}
                onChange={(e) => onChange(e, index, field)}
                className={`bg-gray-700 text-white p-2 rounded w-full ${
                  validationErrors[field] ? "border border-red-500" : ""
                }`}
              />
              {validationErrors[field] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors[field]}</p>
              )}
            </td>
          )
        )}
        <td className="px-4 py-2 text-red-400">✗</td>
        <td className="px-4 py-2 space-x-2">
          <button
            onClick={() => onSave(index)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Save
          </button>
          <button
            onClick={() => onCancel(index)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }
  
  return (
    <tr className="border-b border-gray-700">
      <td className="px-4 py-2">{transaction.date1 || "N/A"}</td>
      <td className="px-4 py-2">{transaction.date2 || "N/A"}</td>
      <td className="px-4 py-2">{transaction.description || "N/A"}</td>
      <td className="px-4 py-2">{formatCurrency(transaction.credit_debit_amount)}</td>
      <td className="px-4 py-2">{formatCurrency(transaction.credit_amount)}</td>
      <td className="px-4 py-2">{formatCurrency(transaction.debit_amount)}</td>
      <td className="px-4 py-2">{formatCurrency(transaction.balance_amount)}</td>
      <td className="px-4 py-2 text-red-400">✗</td>
      <td className="px-4 py-2">
        <button
          onClick={() => onEdit(index)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

const EditTransactions = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // Track editing row
  const [editedTransactions, setEditedTransactions] = useState([]); // Track edits
  const [validationErrors, setValidationErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Transactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);
        setEditedTransactions([...clientData.transactions]); // ✅ Initialize
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = (index) => setIsEditing(index);

  const handleChange = (e, index, field) => {
    const updatedTransactions = [...editedTransactions];
    updatedTransactions[index][field] = e.target.value;
    setEditedTransactions(updatedTransactions);
  };

  const handleSave = (index) => {
    setIsEditing(null);
    console.log("Saved transaction:", editedTransactions[index]);
  };

  const handleCancel = () => {
    setEditedTransactions([...clientData.transactions]); // Reset
    setIsEditing(null);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Edit Transactions" links={links} />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">Edit Transactions</h2>

        {/* Unverified Transactions Table */}
        <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-white mb-4">❌ Unverified Transactions</h2>

          {clientData?.transactions?.some((tx) => tx.verified === "✗") ? (
            <div className="overflow-y-auto h-96">
              <table className="table-auto w-full border-collapse text-white">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="px-4 py-2 text-left">Date1</th>
                    <th className="px-4 py-2 text-left">Date2</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Credit/Debit</th>
                    <th className="px-4 py-2 text-left">Credit Amount</th>
                    <th className="px-4 py-2 text-left">Debit Amount</th>
                    <th className="px-4 py-2 text-left">Balance Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.transactions.map((tx, index) => {
                    if (tx.verified !== "✗") return null; // ✅ Skip verified ones

                    return (
                      <tr key={index} className="border-b border-gray-700">
                        {isEditing === index ? (
                          <>
                            {["date1", "date2", "description", "credit_debit_amount",  "credit_amount", "debit_amount", "balance_amount"].map(
                              (field) => (
                                <td key={field} className="px-4 py-2">
                                  <input
                                    type={field.includes("amount") ? "number" : "text"}
                                    value={tx[field] || ""}
                                    onChange={(e) => handleChange(e, index, field)}
                                    className="bg-gray-700 text-white p-2 rounded w-full"
                                  />
                                </td>
                              )
                            )}
                            <td className="px-4 py-2 text-red-400">✗</td>
                            <td className="px-4 py-2 space-x-2">
                              <button
                                onClick={() => handleSave(index)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2">{tx.date1 || "N/A"}</td>
                            <td className="px-4 py-2">{tx.date2 || "N/A"}</td>
                            <td className="px-4 py-2">{tx.description || "N/A"}</td>
                            <td className="px-4 py-2">
  {tx.credit_debit_amount !== undefined
    ? `R ${parseFloat(tx.credit_debit_amount || 0).toFixed(2)}`
    : "0.00"}
</td>

<td className="px-4 py-2">
  {tx.credit_amount !== undefined
    ? `R ${parseFloat(tx.credit_amount || 0).toFixed(2)}`
    : "0.00"}
</td>

<td className="px-4 py-2">
  {tx.debit_amount !== undefined
    ? `R ${parseFloat(tx.debit_amount || 0).toFixed(2)}`
    : "0.00"}
</td>

<td className="px-4 py-2">
  {tx.balance_amount !== undefined
    ? `R ${parseFloat(tx.balance_amount || 0).toFixed(2)}`
    : "0.00"}
</td>

                            <td className="px-4 py-2 text-red-400">✗</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleEdit(index)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">✅ No unverified transactions found.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EditTransactions;
