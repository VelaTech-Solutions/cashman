import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import EditOverView1 from "../OverViews/EditOverView1";
import EditOverView2 from "../OverViews/EditOverView2";
import EditOverView3 from "../OverViews/EditOverView3";
import EditOverView4 from "../OverViews/EditOverView4";

const ContainerOverViews = ({ transactions }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "View 1", Component: <EditOverView1 transactions={transactions || []} /> },
    { key: "view2", label: "View 2", Component: <EditOverView2 transactions={transactions || []} /> },
    { key: "view3", label: "View 3", Component: <EditOverView3 transactions={transactions || []} /> },
    { key: "view4", label: "View 4", Component: <EditOverView4 transactions={transactions || []} /> },
  ];
  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex items-center h-10 space-x-2">
        <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      </div>
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.Component}
      </div>
    </div>  
  );
};

export default ContainerOverViews;
