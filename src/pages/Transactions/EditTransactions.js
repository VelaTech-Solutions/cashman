// src/pages/ViewReports.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// Component Imports
import LoadClientData from "components/LoadClientData";
import Table from "components/Table"; 
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";


const EditTransactions = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(null); // Track editing row
  const [editedTransactions, setEditedTransactions] = useState([]);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Tansactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" }, // Divider line
  ];
  
  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load client data using the reusable function
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
        setClientData(clientData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } 
    };

    fetchData();
  }, [id]);

  // Filter transactions based on search query
  const filteredTransactions = clientData?.transactions?.filter(
    (transaction) => {
      return (
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.date1?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  const handleEdit = (index) => setIsEditing(index); // Start editing a row

  const handleChange = (e, index, field) => {
    const updatedTransactions = [...editedTransactions];
    updatedTransactions[index][field] = e.target.value;
    setEditedTransactions(updatedTransactions);
  };

  const handleSave = (index) => {
    setIsEditing(null); // Exit editing mode
    // You could add a function here to save the changes to the database
    console.log("Saved transaction:", editedTransactions[index]);
  };

  const handleCancel = () => {
    setEditedTransactions(clientData.transactions); // Reset changes
    setIsEditing(null);
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Edit Transactions" links={links} />

      {/* Main content */}
      <div className="flex-1 p-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
            Edit Transactions
          </h2>
          {/* Add your report rendering logic here */}
          <p className="text-lg text-gray-400">
            This is the placeholder for report rendering functionality.
          </p>
        </section>

        {/* Transactions Table */}
        <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          {filteredTransactions?.length > 0 ? (
            <div className="overflow-y-auto h-96">
              <Table className="table-auto w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-sm">Date1</th>
                    <th className="px-4 py-2 text-sm">Date2</th>
                    <th className="px-4 py-2 text-sm">Description</th>
                    <th className="px-4 py-2 text-sm">Fee Type</th>
                    <th className="px-4 py-2 text-sm">Fee Amount</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Debit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (

                    <tr key={index} className="border-b border-gray-700">
                      <td className="px-4 py-2 text-sm">{transaction.date1}</td>
                      <td className="px-4 py-2 text-sm">{transaction.date2}</td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.fee_type}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {(transaction.fee_amount ?? 0) && typeof transaction.fee_amount === 'number'
                          ? `R ${transaction.fee_amount.toFixed(2)}`
                          : "0.00"}
                      </td>
                     <td className="px-4 py-2 text-sm">
                      {(transaction.credit_amount ?? 0) && typeof transaction.credit_amount === 'number'
                          ? `R ${transaction.credit_amount.toFixed(2)}`
                          : "0.00"}
                      </td>
                       <td className="px-4 py-2 text-sm">
                          {(transaction.debit_amount ?? 0) && typeof transaction.debit_amount === 'number'
                          ? `R ${transaction.debit_amount.toFixed(2)}`
                          : "0.00"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {(transaction.balance_amount ?? 0) && typeof transaction.balance_amount === 'number'
                          ? `R ${transaction.balance_amount.toFixed(2)}`
                          : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">
              No transactions found.
            </p>
          )}
        </section>

        {/* Transactions Table */}
        <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          {filteredTransactions?.length > 0 ? (
            <div className="overflow-y-auto h-96">
              <Table className="table-auto w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-sm">Date1</th>
                    <th className="px-4 py-2 text-sm">Date2</th>
                    <th className="px-4 py-2 text-sm">Description</th>
                    <th className="px-4 py-2 text-sm">Fee Type</th>
                    <th className="px-4 py-2 text-sm">Fee Amount</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Debit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                    <th className="px-4 py-2 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      {isEditing === index ? (
                        <>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="text"
                              value={transaction.date1}
                              onChange={(e) => handleChange(e, index, "date1")}
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="text"
                              value={transaction.date2}
                              onChange={(e) => handleChange(e, index, "date2")}
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="text"
                              value={transaction.description}
                              onChange={(e) =>
                                handleChange(e, index, "description")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="text"
                              value={transaction.fee_type}
                              onChange={(e) =>
                                handleChange(e, index, "fee_type")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={transaction.fee_amount || ""}
                              onChange={(e) =>
                                handleChange(e, index, "fee_amount")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={transaction.credit_amount || ""}
                              onChange={(e) =>
                                handleChange(e, index, "credit_amount")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={transaction.debit_amount || ""}
                              onChange={(e) =>
                                handleChange(e, index, "debit_amount")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={transaction.balance_amount || ""}
                              onChange={(e) =>
                                handleChange(e, index, "balance_amount")
                              }
                              className="bg-gray-700 text-white p-2 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm space-x-2">
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
                          <td className="px-4 py-2 text-sm">
                            {transaction.date1}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {transaction.date2}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {transaction.fee_type}
                          </td>
                          <td className="px-4 py-2 text-sm">
                          {(transaction.fee_amount ?? 0) && typeof transaction.fee_amount === 'number'
                          ? `R ${transaction.fee_amount.toFixed(2)}`
                          : "0.00"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                          {(transaction.credit_amount ?? 0) && typeof transaction.credit_amount === 'number'
                          ? `R ${transaction.credit_amount.toFixed(2)}`
                          : "0.00"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                          {(transaction.debit_amount ?? 0) && typeof transaction.debit_amount === 'number'
                          ? `R ${transaction.debit_amount.toFixed(2)}`
                          : "0.00"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                          {(transaction.balance_amount ?? 0) && typeof transaction.balance_amount === 'number'
                          ? `R ${transaction.balance_amount.toFixed(2)}`
                          : "0.00"}
                          </td>
                          <td className="px-4 py-2 text-sm">
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
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">
              No transactions found.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EditTransactions;
