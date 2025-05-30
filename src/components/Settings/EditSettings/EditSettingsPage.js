import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


// Component Imports
import { Sidebar } from 'components/Common';

// Nested Components
// import CategorySettingsAddCategory from "./EditSettings/CategorySettingsAddCategory"; 
// import CategorySettingsAddSubcategory from "./EditSettings/CategorySettingsAddSubcategory";
// import CategorySettingsTransactions from "./EditSettings/CategorySettingsTransactions"; 

const EditSettings = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("none");

  const links = [
    { path: "goBack", label: "Back", icon: "ph-arrow-left" },

    { type: "divider" },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("add-category")}
          className="w-full text-left px-4 py-2 mb-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-all"
        >
          ➕ Add Category
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("add-subcategory")}
          className="w-full text-left px-4 py-2 mb-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-all"
        >
          ➕ Add Subcategory
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("transactions")}
          className="w-full text-left px-4 py-2 mb-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded transition-all"
        >
          📂 View Transactions
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Category Settings" links={links} />

      <div className="flex-1 p-8">
        {/* {activePage === "transactions" && <CategorySettingsTransactions />}

        {activePage === "add-category" && <CategorySettingsAddCategory />}

        {activePage === "add-subcategory" && <CategorySettingsAddSubcategory />} */}
        {activePage === "none" && (
          <p className="text-gray-500">Select an action from the sidebar.</p>
        )}
      </div>
    </div>
  );
};

export default EditSettings;
