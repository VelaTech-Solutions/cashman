import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import OverView1 from "../OverViews/OverView1";

const ContainerOverViews = ({ data }) => {
  // const [activeView, setActiveView] = useState("view1");
  // const views = [
  //   { key: "view1", label: "View 1", Component: <OverView1 data={data || []} /> },

  // ];
  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="flex items-center h-10 space-x-2">
        <OverView1 data={data || []} /> 
          {/* views={views} 
          activeViewKey={activeView} 
          setActiveViewKey={setActiveView} 
        /> */}
      </div>
      {/* <div className="mt-6">
        {views.find((v) => v.key === activeView)?.Component}
      </div> */}
    </div>  
  );
};

export default ContainerOverViews;
