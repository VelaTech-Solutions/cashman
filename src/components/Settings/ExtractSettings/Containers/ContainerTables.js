// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerTables.js

import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';



const ContainerTables = ({ transactions, selectedTransactions, setSelectedTransactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Original",
      component: (
        <EditTableOriginal
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
  ];

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default ContainerTables;
