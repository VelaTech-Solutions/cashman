import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import OriginalTable from "../Tables/OriginalTable";
import UncategorizedTable from "../Tables/UncategorizedTable";
import CategorizedTable from "../Tables/CategorizedTable";

const ContainerTables = ({ clientId }) => {
  const [activeView, setActiveView] = useState("view2");
  const views = [
    {
      key: "view1",
      label: "Original",
      component: (
        <OriginalTable
        clientId={clientId}
        />
      ),
    },
    {
      key: "view2",
      label: "Uncategorized",
      component: (
        <UncategorizedTable 
        clientId={clientId}
        />
      ),
    },
    {
      key: "view3",
      label: "Categorized",
      component: (
        <CategorizedTable 
        clientId={clientId}
        />
      ),
    },

  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex items-center h-10 space-x-2">
        <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      </div>
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default ContainerTables;
