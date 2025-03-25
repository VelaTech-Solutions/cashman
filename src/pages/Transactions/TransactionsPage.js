import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Components imports
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import ViewSwitcher from "components/Common/ViewSwitcher";
import TransactionsOverview1 from "components/Transactions/TransactionsOverview1";
import TransactionsOverview2 from "components/Transactions/TransactionsOverview2";
import TransactionsOverview3 from "components/Transactions/TransactionsOverview3";
import TransactionsOverview4 from "components/Transactions/TransactionsOverview4";


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
  const views = [
    { key: "view1", label: "View 1", Component: <TransactionsOverview1 transactions={clientData?.transactions || []} /> },
    { key: "view2", label: "View 2", Component: <TransactionsOverview2 transactions={clientData?.transactions || []} /> },
    { key: "view3", label: "View 3", Component: <TransactionsOverview3 transactions={clientData?.transactions || []} /> },
    { key: "view4", label: "View 4", Component: <TransactionsOverview4 transactions={clientData?.transactions || []} /> },
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Client Profile" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Transactions</h1>
        </header>
          <div className="flex items-center h-10 space-x-2">
            <ViewSwitcher
              views={views}
              activeViewKey={activeView}
              setActiveViewKey={setActiveView}
            />
          </div>
          <div className="mt-6">
            {views.find((v) => v.key === activeView)?.Component}
          </div>
        </div>
      </div>

  );
};

export default TransactionsPage;
