import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar, LoadClientData, LoadTransactions } from 'components/Common';
import ContainerOverView from "../components/Transactions/TransactionsPage/Containers/ContainerOverView";

const TransactionsPage = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("view1");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
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

    // load transactions
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const loadedTransactions = await LoadTransactions(id);
          setTransactions(loadedTransactions);
        } catch (err) {
          console.error("Error fetching transactions:", err);
          setError(err.message);
        }
      };
      fetchTransactions();
    }, [id]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Client Profile" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Transactions</h1>
        </header>
        <div className="flex justify-start items-center space-x-4 mb-4">
            <ContainerOverView transactions={transactions}
            />
          </div>
          <div className="mt-6">
            {/* {views.find((v) => v.key === activeView)?.Component} */}
          </div>
        </div>
      </div>

  );
};

export default TransactionsPage;
