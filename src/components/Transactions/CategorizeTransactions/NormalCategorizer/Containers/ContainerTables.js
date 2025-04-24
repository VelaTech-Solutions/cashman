import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import CategorizeTables1 from "../Tables/CategorizeTables1";
import CategorizeTables2 from "../Tables/CategorizeTables2";

const ContainerTables = ({ 
  clientId,
  transactions,
  selectedTransactions,
  setSelectedTransactions }) => {
  const [activeView, setActiveView] = useState("view2");
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
        <CategorizeTables2 
        
        clientId={clientId}
        transactions={transactions}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}/>
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
