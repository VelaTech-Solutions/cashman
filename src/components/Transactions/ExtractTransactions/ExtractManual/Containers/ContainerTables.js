// src/components/Transactions/EditTransactions/Containers/ContainerTables.js

import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';

import EditTransactions from "../Tables/EditTransactions";
import ShowFilteredData from "../Tables/ShowFilteredData";
import ShowRawData from "../Tables/ShowRawData";
import ShowTransactions from "../Tables/ShowTransactions";
import ViewTransactions from "../Tables/ViewTransactions";


const ContainerTables = ({ transactions, selectedTransactions, setSelectedTransactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Original",
      component: (
        <EditTransactions
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
    // {
    //   key: "view2",
    //   label: "Broken",
    //   component: (
    //     <ShowFilteredData
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
    // {
    //   key: "view3",
    //   label: "Missing Descriptions",
    //   component: (
    //     <ShowRawData
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
    // {
    //   key: "view3",
    //   label: "Zero Amounts",
    //   component: (
    //     <ShowTransactions
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
    // {
    //   key: "view4",
    //   label: "Duplicates",
    //   component: (
    //     <ViewTransactions
    //       transactions={transactions}
    //       selectedTransactions={selectedTransactions}
    //       setSelectedTransactions={setSelectedTransactions}
    //     />
    //   ),
    // },
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
