// src/components/Settings/ExtractSettings/Containers/ContainerViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import MainViews from "../Views/MainViews";
import BankSettingsViews from "../Views/BankSettingsViews";
// import CategorySettingsTransactions from "../Views/CategorySettingsTransactions";


const ContainerViews = ({ viewMode, setViewMode }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Main Settings", Component: <MainViews 
      viewMode={viewMode}
      setViewMode={setViewMode}
         /> },
    { key: "view2", label: "Bank Settings", Component: <BankSettingsViews 
      viewMode={viewMode}
      setViewMode={setViewMode}
          /> },
    // { key: "view3", label: "Settings Transactions", Component: <CategorySettingsTransactions 
    //   viewMode={viewMode}
    //   setViewMode={setViewMode}
    //       /> },
  ];
  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex items-center h-10 space-x-2">
        <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      </div>
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.Component}
      </div>
    </div>  
  );
};

export default ContainerViews;

