import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import EditTable1 from "../Tables/EditTable1";
import EditTable2 from "../Tables/EditTable2";
import EditTable3 from "../Tables/EditTable3";
import EditTable4 from "../Tables/EditTable4";


const ContainerTables = ({ transactions, selectedTransactions, setSelectedTransactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Table 1",
      component: (
        <EditTable1
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view2",
      label: "Table 2",
      component: (
        <EditTable2
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view3",
      label: "Table 3",
      component: (
        <EditTable3
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view4",
      label: "Table 4",
      component: (
        <EditTable4
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
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
