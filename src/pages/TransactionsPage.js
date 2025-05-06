import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';
import OverView2 from "../components/Transactions/TransactionsPage/OverViews/OverView2";

const TransactionsPage = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      path: `/client/${clientId}/view-transactions`,
      label: "View Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${clientId}/edit-transactions`,
      label: "Edit Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${clientId}/categorize-transactions`,
      label: "Categorize Transactions",
      icon: "ph-file-text",
    },
    {
      path: `/client/${clientId}/extract-transactions`,
      label: "Extract Transactions",
      icon: "ph-file-text",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setBankName(clientData.bankName || "Unknown");
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Client Profile" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Transactions</h1>
        </header>
            <OverView2 transactions={transactions}
            />
        </div>
      </div>

  );
};

export default TransactionsPage;
