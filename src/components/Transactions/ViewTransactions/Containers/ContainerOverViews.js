import React, { Component, useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import OverView from "../OverViews/OverView1";
import OverView2 from "../OverViews/OverView2";
import OverView3 from "../OverViews/OverView3";
import OverView4 from "../OverViews/OverView4";

const ContainerOverView = ({ transactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "View 1", Component: <OverView1 transactions={transactions || []} /> },
    { key: "view2", label: "View 2", Component: <OverView2 transactions={transactions || []} /> },
    { key: "view3", label: "View 3", Component: <OverView3 transactions={transactions || []} /> },
    { key: "view4", label: "View 4", Component: <OverView4 transactions={transactions || []} /> },
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

export default ContainerOverView;
