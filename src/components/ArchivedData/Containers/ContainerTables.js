// src/components/ArchivedData/Containers/ContainerTables.js

import React, { useState } from "react";

// Component Imports
// import { ViewSwitcher } from "components/Common";
import ArchivedDataTable from "../Tables/ArchivedDataTable";



const ContainerTables = ({ data }) => {
  // const [activeView, setActiveView] = useState("view1");
  // const views = [
  //   {
  //     key: "view1",
  //     label: "Original",
  //     component: (
  //       <ArchivedDataTable
  //       data={data}
  //       />
  //     ),
  //   },
  // ];

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">

      <ArchivedDataTable
      data={data}
      />
      {/* <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div> */}
    </div>
  );
};

export default ContainerTables;




// components/ArchivedData/Tables/ArchivedDataTable.js
// display the data nicely we have the