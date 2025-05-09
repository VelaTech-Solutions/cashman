import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';
import OverViews from "../EditTransactions/OverViews/OverView";
import ContainerTables from "../EditTransactions/Containers/ContainerTables";

const EditTransactions = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}/transactionspage`, label: "Back to Transactions", icon: "ph-file-text" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-user" },
    { type: "divider" },
    {
      path: `/EditSettings`,
      label: "Edit Settings",
      icon: "ph-arrow-left",
    },
    { 
      path: "/HelpEdit", 
      label: "Edit Help", 
      icon: "ph-arrow-left" 
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

  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Edit Transactions" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Edit Transactions</h2>
        <div className="flex justify-start items-center space-x-4 mb-4">
          <OverViews transactions={clientData?.transactions || []} />
        </div>
        <div className="flex justify-start items-center space-x-4 mb-4">
          <ContainerTables clientId={clientId} />
        </div>
      </div>
    </div>
  );
};

export default EditTransactions;
