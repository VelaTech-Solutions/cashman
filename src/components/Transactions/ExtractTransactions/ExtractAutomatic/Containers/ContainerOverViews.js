// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerOverViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import ExtractOverView1 from "../OverViews/ExtractOverView1";
import ExtractOverView2 from "../OverViews/ExtractOverView2";
import ExtractOverView3 from "../OverViews/ExtractOverView3";
import ExtractOverView4 from "../OverViews/ExtractOverView4";

const ContainerOverViews = ({ transactions, bankName }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "View 1", Component: <ExtractOverView1 transactions={transactions || []} bankName={bankName} /> },
    { key: "view2", label: "View 2", Component: <ExtractOverView2 transactions={transactions || []} /> },
    { key: "view3", label: "View 3", Component: <ExtractOverView3 transactions={transactions || []} /> },
    { key: "view4", label: "View 4", Component: <ExtractOverView4 transactions={transactions || []} /> },
  ];
  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
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
  );
};

export default ContainerOverViews;


