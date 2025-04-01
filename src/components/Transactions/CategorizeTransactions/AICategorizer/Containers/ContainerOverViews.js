import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import CategorizeOverview1 from "./CategorizeTransactionsOverview1";
import CategorizeOverview2 from "./CategorizeTransactionsOverview2";
import CategorizeOverview3 from "./CategorizeTransactionsOverview3";

const ContainerOverViews = ({ transactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "View 1", Component: <CategorizeOverview1 transactions={transactions || []} /> },
    { key: "view2", label: "View 2", Component: <CategorizeOverview2 transactions={transactions || []} /> },
    { key: "view3", label: "View 3", Component: <CategorizeOverview3 transactions={transactions || []} /> },
  ];
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">

        <div className="flex items-center h-10 space-x-2">
          <ViewSwitcher
            views={views}
            activeViewKey={activeView}
            setActiveViewKey={setActiveView}
          />
        </div>
        <div className="mt-6">
          {views.find((v) => v.key === activeView)?.Component}
        </div>
      </div>  
    </div>
  );
};

export default ContainerOverViews;
