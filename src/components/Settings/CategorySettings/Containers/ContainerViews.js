// src/components/Settings/ExtractSettings/Containers/ContainerViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import CategorySettingsAddCategory from "../Views/CategorySettingsAddCategory";
import CategorySettingsAddSubcategory from "../Views/CategorySettingsAddSubcategory";
import CategorySettingsTransactions from "../Views/CategorySettingsTransactions";


const ContainerViews = ({ viewMode, setViewMode }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Add Category", Component: <CategorySettingsAddCategory 
      viewMode={viewMode}
      setViewMode={setViewMode}
         /> },
    { key: "view2", label: "Add Subcategory", Component: <CategorySettingsAddSubcategory 
      viewMode={viewMode}
      setViewMode={setViewMode}
          /> },
    { key: "view3", label: "Settings Transactions", Component: <CategorySettingsTransactions 
      viewMode={viewMode}
      setViewMode={setViewMode}
          /> },
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

