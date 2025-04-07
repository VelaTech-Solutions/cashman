// src/components/Transactions/EditTransactions/Containers/ContainerTables.js

import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import EditTable2 from "../Tables/EditTable2";
import EditTable3 from "../Tables/EditTable3";
import EditTable4 from "../Tables/EditTable4";

import EditTableOriginal from "../Tables/EditTableOriginal";
import EditTableBroken from "../Tables/EditTableBroken";
import EditTableMissingDescriptions from "../Tables/EditTableMissingDescriptions";
import EditTableZeroAmounts from "../Tables/EditTableZeroAmounts";
import EditTableDuplicates from "../Tables/EditTableDuplicates";


const ContainerTables = ({ transactions, selectedTransactions, setSelectedTransactions, id }) => {
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
          id={id}
        />
      ),
    },
    {
      key: "view5",
      label: "Broken",
      component: (
        <EditTableBroken
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view6",
      label: "Missing Descriptions",
      component: (
        <EditTableMissingDescriptions
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view7",
      label: "Zero Amounts",
      component: (
        <EditTableZeroAmounts
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    {
      key: "view8",
      label: "Duplicates",
      component: (
        <EditTableDuplicates
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    // {
    //   key: "view2",
    //   label: "Table 2",
    //   component: (
    //     <EditTable2
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
    // {
    //   key: "view3",
    //   label: "Table 3",
    //   component: (
    //     <EditTable3
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
    // {
    //   key: "view4",
    //   label: "Table 4",
    //   component: (
    //     <EditTable4
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
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
