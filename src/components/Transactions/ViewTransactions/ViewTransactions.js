// src/pages/ViewTransactions.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase imports
import { db } from "../../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

// Component Imports
import { Sidebar, LoadClientData, Table } from 'components/Common';
import ContainerOverViews from "../ViewTransactions/Containers/ContainerOverViews";
// import ContainerTables from "../EditTransactions/Containers/ContainerTables";


const ViewTransactions = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically generate links with the `clientId`
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}/transactionspage`, label: "Back to Tansactions", icon: "ph-file-text" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      path: `/viewSettings/${clientId}`,
      label: "View Settings",
      icon: "ph-arrow-left",
    },
    { 
      path: "/HelpView", 
      label: "View Help", 
      icon: "ph-arrow-left" 
    },
  ];

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
          try {
          const clientData = await LoadClientData(clientId);
          setClientData(clientData);
          setTransactions(clientData);
          } catch (err) {
          console.error("Error fetching data:", err.message);
          setError("Failed to fetch Client Data.");
          }
      };
  
      fetchData();
      }, [clientId]);

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
      <Sidebar title="View Transactions" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">View Transactions</h2>
        <div className="flex justify-start items-center space-x-4 mb-4">
          <ContainerOverViews transactions={clientData?.transactions || []} />
        </div>
        {/* Overview Section */}
        {/* <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
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
                0
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Corrected Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                0
              </p>
            </div>
          </div>
        </section> */}

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
              <Table className="table-auto w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-sm">Date1</th>
                    <th className="px-4 py-2 text-sm">Date2</th>
                    <th className="px-4 py-2 text-sm">Description</th>
                    <th className="px-4 py-2 text-sm">Fee Type</th>
                    <th className="px-4 py-2 text-sm">Fee Amount</th>
                    <th className="px-4 py-2 text-sm">Credit/Debit</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      
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
                        {transaction.fee_amount}
                      </td>
                     
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_debit_amount}
                      </td>
                     
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_amount}
                      </td>

                      <td className="px-4 py-2 text-sm">
                        {transaction.balance_amount}
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
                    <th className="px-4 py-2 text-sm">Credit/Debit</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Debit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      
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
                        {transaction.fee_amount}
                      </td>
                     
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_debit_amount}
                      </td>
                     
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_amount}
                      </td>

                      <td className="px-4 py-2 text-sm">
                        {transaction.debit_amount}
                      </td>

                      <td className="px-4 py-2 text-sm">
                        {transaction.balance_amount}
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
      </div>
    </div>
  );
};

export default ViewTransactions;
