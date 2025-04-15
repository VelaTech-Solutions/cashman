import React, { useState } from "react";
import { useParams } from "react-router-dom";

// Components
import { Sidebar } from "components/Common";
import NormalCategorizer from "components/Transactions/CategorizeTransactions/NormalCategorizer/NormalCategorizePage";
import SmartCategorizer from "components/Transactions/CategorizeTransactions/SmartCategorizer/SmartCategorizePage";
import AICategorizer from "components/Transactions/CategorizeTransactions/AICategorizer/AICategorizePage";
// import PlayCategorizer from "components/Transactions/CategorizeTransactions/PlayCategorizer/PlayCategorizer";

const CategorizeTransactions = () => {
  const { id: clientId } = useParams();
  const [activePage, setActivePage] = useState("NormalCategorizer");

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}/transactionspage`, label: "Back to Transactions", icon: "ph-file-text" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      type: "custom",
      content: (
        <button onClick={() => setActivePage("NormalCategorizer")} className="w-full text-left px-4 py-2 mb-2 bg-blue-500 hover:bg-blue-600 text-black rounded transition-all">
          Normal Categorizer
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button onClick={() => setActivePage("SmartCategorizer")} className="w-full text-left px-4 py-2 mb-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded transition-all">
          Smart Categorizer
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button onClick={() => setActivePage("AICategorizer")} className="w-full text-left px-4 py-2 mb-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-all">
          AI Categorizer
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button onClick={() => setActivePage("PlayCategorizer")} className="w-full text-left px-4 py-2 mb-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all">
          Play Categorizer
        </button>
      ),
    },
    { type: "divider" },
    { path: `/categorysettings/${clientId}`, label: "Category Settings", icon: "ph-file-text" },
    { path: "/HelpCategory", label: "Category Help", icon: "ph-file-text" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Categorize Transactions" links={links} />
      <div className="flex-1 p-8">
        {activePage === "NormalCategorizer" && <NormalCategorizer clientId={clientId} />}
        {activePage === "SmartCategorizer" && <SmartCategorizer clientId={clientId} />}
        {activePage === "AICategorizer" && <AICategorizer clientId={clientId} />}
        {/* {activePage === "PlayCategorizer" && <PlayCategorizer clientId={clientId} />} */}
      </div>
    </div>
  );
};

export default CategorizeTransactions;
