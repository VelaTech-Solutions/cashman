import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components imports
import "styles/tailwind.css";
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";

import ViewTransactions from "./ViewTransactions";

import TransactionsOverview1 from "components/Transactions/TransactionsOverview1";
import TransactionsOverview2 from "components/Transactions/TransactionsOverview2";
import TransactionsOverview3 from "components/Transactions/TransactionsOverview3";
import Button from "components/Button";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  setDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";

const TransactionsPage = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState(1);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" }, // Divider line
    {
      path: `/client/${id}/view-transactions`,
      label: "View Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${id}/edit-transactions`,
      label: "Edit Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${id}/categorize-transactions`,
      label: "Categorize Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${id}/extract-transactions`,
      label: "Extract Transactions",
      icon: "ph-file-text",
    },
  ];

  // Fetch client data (which contains the transactions array)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const loadedClientData = await LoadClientData(id);
        setClientData(loadedClientData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Client Profile" links={links} />
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Transactions</h1>
        </header>

        {/* Toggle View Buttons */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setViewMode(1)}
            className={`px-4 py-2 rounded-md text-sm ${
              viewMode === 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Overview 1 📄
          </button>
          <button
            onClick={() => setViewMode(2)}
            className={`px-4 py-2 rounded-md text-sm ${
              viewMode === 2 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Overview 2 📊
          </button>
          <button
            onClick={() => setViewMode(3)}
            className={`px-4 py-2 rounded-md text-sm ${
              viewMode === 3 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            Overview 3 🚀
          </button>
        </div>

        {/* Render the selected Overview */}
        {viewMode === 1 ? (
          <TransactionsOverview1 transactions={clientData?.transactions || []} />
        ) : viewMode === 2 ? (
          <TransactionsOverview2 transactions={clientData?.transactions || []} />
        ) : (
          <TransactionsOverview3 transactions={clientData?.transactions || []} />
        )}

        {/* Additional UI for toggles, modes, etc. */}
        {/* <div> ... </div> */}
      </div>
    </div>
  );
};

export default TransactionsPage;
