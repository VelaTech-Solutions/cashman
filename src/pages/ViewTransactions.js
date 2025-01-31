// src/pages/ViewTransactions.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/tailwind.css";
import Sidebar from "../components/Sidebar";



// Firebase imports
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";


const ViewTransactions = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically generate links with the `id`
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
  ];

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClientData(docSnap.data());
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to fetch client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
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
  
  if (error) return <div>Error: {error}</div>;


  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="View Transactions" links={links} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            View Transactions
          </h1>
        </header>

        {/* Overview Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">
            Transactions Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                {clientData?.transactions?.length ?? 0}
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Transactions Needing Review
              </p>
              <p className="text-3xl font-bold text-white">
                {/* Placeholder */}0
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Corrected Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                {/* Placeholder */}0
              </p>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="mt-8">
          <input
            type="text"
            placeholder="Search transactions by date or description..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        {/* Transactions Table */}
        <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          {filteredTransactions?.length > 0 ? (
            <div className="overflow-y-auto h-96">
              <table className="table-auto w-full text-left">
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
                        {transaction.fee_amount
                          ? `R ${transaction.fee_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_amount
                          ? `R ${transaction.credit_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.debit_amount
                          ? `R ${transaction.debit_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.balance_amount
                          ? `R ${transaction.balance_amount.toFixed(2)}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default ViewTransactions;
