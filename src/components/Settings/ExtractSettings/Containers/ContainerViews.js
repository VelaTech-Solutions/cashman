// src/components/Settings/ExtractSettings/Containers/ContainerViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import ExtractRemovalView1 from "../Views/ExtractRemovalView1";
import ExtractAlignmentView2 from "../Views/ExtractAlignmentView2";
import ExtractDescriptionView3 from "../Views/ExtractDescriptionView3";
import ExtractDatesView4 from "../Views/ExtractDatesView4";


const ContainerViews = ({ viewMode, setViewMode }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Removal Settings", Component: <ExtractRemovalView1 
      viewMode={viewMode}
      setViewMode={setViewMode}
         /> },
    { key: "view2", label: "Alignment Settings", Component: <ExtractAlignmentView2 
      viewMode={viewMode}
      setViewMode={setViewMode}
          /> },
    { key: "view3", label: "Description Settings", Component: <ExtractDescriptionView3 
      viewMode={viewMode}
      setViewMode={setViewMode}
          /> },
    { key: "view4", label: "Dates Settings", Component: <ExtractDatesView4
      viewMode={viewMode}
      setViewMode={setViewMode}
          />
            },
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

export default ContainerViews;

