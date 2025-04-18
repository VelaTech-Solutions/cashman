import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import CategorizeTables1 from "../Tables/CategorizeTables1";
import CategorizeTables2 from "../Tables/CategorizeTables2";
import CategorizeTables3 from "../Tables/CategorizeTables3";
import CategorizeTablesGroup4 from "../Tables/CategorizeTablesGroup4";


const ContainerTables = ({ clientId }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Table 1",
      component: (
        <CategorizeTables1 clientId={clientId}/>
      ),
    },
    {
      key: "view2",
      label: "Table 2",
      component: (
        <CategorizeTables2 clientId={clientId}/>
      ),
    },
    {
      key: "view3",
      label: "Table 3",
      component: (
        <CategorizeTables3 clientId={clientId}/>
      ),
    },
    {
      key: "view4",
      label: "Group Table",
      component: (
        <CategorizeTablesGroup4 clientId={clientId}/>
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
