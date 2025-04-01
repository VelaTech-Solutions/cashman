// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerActions.js

import React, { useState } from "react";

// Component Imports
import{ ViewSwitcher } from 'components/Common';
import IgnoredLineActions1 from "../Actions/IgnoredLineActions1";
// import IgnoredLineActions2 from "../Actions/IgnoredLineActions2";

const ContainerActions = ({ id, bankName, clientData, setClientData, setIsProcessing, setExtractionStatus, setProcessingMethod }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Actions 1", component: (<IgnoredLineActions1
          id={id}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
          setProcessingMethod={setProcessingMethod}
        />
      ),
    },
    // { key: "view2", label: "Actions 2", component: (<IgnoredLineActions2
    //       id={id}
    //       bankName={bankName}
    //       clientData={clientData}
    //       setClientData={setClientData}
    //       setIsProcessing={setIsProcessing}
    //       setExtractionStatus={setExtractionStatus}
    //       setProcessingMethod={setProcessingMethod}
    //     />
    //   ),
    // },
  ];

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default ContainerActions;
