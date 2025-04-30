// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerActions.js

import React, { useState } from "react";

// Component Imports
import{ ViewSwitcher } from 'components/Common';
import AutomaticActions1 from "../Actions/AutomaticActions1";

const ContainerActions = ({ clientId, bankName, clientData, setClientData, setIsProcessing, setExtractionStatus, setProcessingMethod }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Actions 1", component: (<AutomaticActions1
          clientId={clientId}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
          setProcessingMethod={setProcessingMethod}
        />
      ),
    },
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
