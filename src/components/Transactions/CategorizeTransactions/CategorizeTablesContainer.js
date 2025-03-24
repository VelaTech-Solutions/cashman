import React, { useState } from "react";
import CategorizeTables1 from "./CategorizeTables1";
import CategorizeTables2 from "./CategorizeTables2";
import CategorizeTables3 from "./CategorizeTables3";
import ViewSwitcher from "components/Common/ViewSwitcher";

const CategorizeTablesContainer = ({ transactions, selectedTransactions, setSelectedTransactions }) => {
  const [activeView, setActiveView] = useState("view1");

  const views = [
    {
      key: "view1",
      label: "Table 1",
      component: (
        <CategorizeTables1
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
        <CategorizeTables2
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
        <CategorizeTables3
          transactions={transactions}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      ),
    },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      <div className="mt-4">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default CategorizeTablesContainer;
