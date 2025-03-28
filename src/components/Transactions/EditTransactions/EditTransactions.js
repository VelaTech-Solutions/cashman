import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import { Sidebar, LoadClientData, ViewSwitcher } from 'components/Common';
import ContainerTables from "../EditTransactions/Containers/ContainerTables";

const EditTransactions = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("view1");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Transactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-user" },
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
  // const views = [
  //   { key: "view1", label: "View 1", Component: <EditTransactionView1 transactions={clientData?.transactions || []} /> },
  //   { key: "view2", label: "View 2", Component: <EditTransactionView2 transactions={clientData?.transactions || []} /> },
  //   { key: "view3", label: "View 3", Component: <EditTransactionView3 transactions={clientData?.transactions || []} /> },
  //   { key: "view4", label: "View 4", Component: <EditTransactionView4 transactions={clientData?.transactions || []} /> },
  // ];
  useEffect(() => {
    const load = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        setError("Failed to load client data.");
      }
    };
    load();
  }, [id]);

  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Edit Transactions" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Edit Transactions</h2>
        <div className="flex items-center h-10 space-x-2">
          <ContainerTables
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

export default EditTransactions;
