// Containers/ContainerViews.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';

import IgnoredLines from "../Views/IgnoredLines";
import FuzzyIgnoredLines from "../Views/FuzzyIgnoredLines";

const ContainerViews = ({ viewMode, setViewMode }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Ignored Lines",
      Component: <IgnoredLines viewMode={viewMode} setViewMode={setViewMode} />
    },
    {
      key: "view2",
      label: "Fuzzy Ignored lines",
      Component: <FuzzyIgnoredLines viewMode={viewMode} setViewMode={setViewMode} />
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
