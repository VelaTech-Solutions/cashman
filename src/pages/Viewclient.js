// src/pages/ViewClient.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase"; // Ensure this is the correct path
import { collection, getDocs } from "firebase/firestore";

const Viewclient = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const clientsPerPage = 6; // Number of clients per page


  // Track user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("Not logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch client data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, "clients");
        const clientSnapshot = await getDocs(clientsCollection);
        const clientsList = clientSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsList);
      } catch (err) {
        setError("Failed to fetch clients. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Loading or error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-gray-400">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    `${client.clientName} ${client.clientSurname} ${client.id} ${client.bankName}`
      .toLowerCase()
      .includes(searchQuery)
  );
  // Paginate the filtered clients
  // const currentClients = filteredClients.slice(
  //   (currentPage - 1) * clientsPerPage,
  //   currentPage * clientsPerPage
  // );

  // Main UI
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <motion.div
        className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg ${
          sidebarOpen ? "block" : "hidden lg:block"
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4 pt-4">
          <h1 className="text-2xl font-bold text-blue-400">
            Cash Flow Manager
          </h1>
        </div>
        {/* User Email */}
        <div className="text-sm text-gray-300 border-t border-gray-700 pt-4">
          <p>Logged in as:</p>
          <p className="font-medium text-white">{userEmail || "Guest"}</p>
        </div>

        <nav className="space-y-4 border-t border-gray-700 pt-4">
          <Link to="/dashboard" className="hover:text-white transition">
            Back to Dashboard
          </Link>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>
        </header>

        {/* Client Overview Section */}
        <section>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">
              Client Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {/* Total Clients */}
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <p className="text-lg font-bold text-blue-400">Total Clients</p>
                <p className="text-3xl font-bold text-white">
                  {clients.length}
                </p>
              </div>
              {/* Reports Completed */}
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <p className="text-lg font-bold text-blue-400">
                  Reports Completed
                </p>
                <p className="text-3xl font-bold text-white">
                  {
                    clients.filter((client) => client.status === "Completed")
                      .length
                  }
                </p>
              </div>
              {/* Reports Pending */}
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <p className="text-lg font-bold text-blue-400">
                  Reports Pending
                </p>
                <p className="text-3xl font-bold text-white">
                  {
                    clients.filter((client) => client.status === "Pending")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="mt-8">
          <input
            type="text"
            placeholder="Search clients by name, ID, or bank..."
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            value={searchQuery} // To bind the search query state
            className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        {/* Client Listing with Pagination */}
        <section className="mt-8">
          {filteredClients.length === 0 ? (
            <p className="text-center text-lg text-gray-500">No clients found.</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients
                  .slice(currentPage * clientsPerPage, (currentPage + 1) * clientsPerPage)
                  .map((client) => (
                    <div
                      key={client.id}
                      className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
                    >
                    <h3 className="text-xl font-bold text-blue-400">
                      {client.clientName} {client.clientSurname}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      <span className="font-bold">ID:</span> {client.id}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Bank:</span> {client.bankName}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Status:</span> {client.status}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Date Created:</span>{" "}
                      {client.dateCreated}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Date Updated:</span>{" "}
                      {client.dateUpdated}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Date Closed:</span>{" "}
                      {client.dateClosed}
                    </p>
                    <p className="text-sm text-gray-400">
                      {/* placeholder Please Extract Transactions */}
                      <span className="font-bold">Transactions:</span> | Extract Transactions
                      {client.number_of_transactions}
                    </p>
                    <p className="text-sm text-gray-400">
                      <span className="font-bold">Captured By:</span>{" "}
                      {client.userEmail}
                    </p>
                    <Link
                      to={`/client/${client.id}`}
                      className="mt-4 inline-block text-blue-400 hover:underline text-sm font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  className="bg-gray-700 text-white py-2 px-4 rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
                <button
                  className="bg-gray-700 text-white py-2 px-4 rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredClients.length / clientsPerPage) - 1)
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(filteredClients.length / clientsPerPage) - 1
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Viewclient;
