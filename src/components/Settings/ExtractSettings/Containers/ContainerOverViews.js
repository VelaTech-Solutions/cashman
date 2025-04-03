// src/components/Settings/ExtractSettings/Containers/ContainerOverViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import ExtractSettingsOverView1 from "../OverViews/ExtractSettingsOverView1";
import ExtractSettingsOverView2 from "../OverViews/ExtractSettingsOverView2";
import ExtractSettingsOverView3 from "../OverViews/ExtractSettingsOverView3";
import ExtractSettingsOverView4 from "../OverViews/ExtractSettingsOverView4";

const ContainerOverViews = ({  }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "View 1", Component: <ExtractSettingsOverView1  /> },
    { key: "view2", label: "View 2", Component: <ExtractSettingsOverView2  /> },
    { key: "view3", label: "View 3", Component: <ExtractSettingsOverView3  /> },
    { key: "view4", label: "View 4", Component: <ExtractSettingsOverView4  /> },
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


