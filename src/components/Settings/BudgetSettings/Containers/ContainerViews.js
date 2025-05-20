// Containers/ContainerViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';

import BudgetSettingView from "../Views/BudgetSettingView";
import CategoryCellPlacement from "../Views/CategoryCellPlacement";
import MonthCellPlacement from "../Views/MonthCellPlacement"
import ExcelSheetSettings from "../Views/ExcelSheetSettings";

const ContainerViews = ({ viewMode, setViewMode }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Budget Setting View",
      Component: <BudgetSettingView viewMode={viewMode} setViewMode={setViewMode} />
    },
    {
      key: "view2",
      label: "Category Cell Placement",
      Component: <CategoryCellPlacement viewMode={viewMode} setViewMode={setViewMode} />
    },
    {
      key: "view3",
      label: "Month Cell Placement",
      Component: <MonthCellPlacement viewMode={viewMode} setViewMode={setViewMode} />
    },
    {
      key: "view4",
      label: "Excel Sheet Settings",
      Component: <ExcelSheetSettings viewMode={viewMode} setViewMode={setViewMode} />
    },
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
