// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerActions.js

import React, { useState } from "react";

// Component Imports
import{ ViewSwitcher } from 'components/Common';
import ManualActions1 from "../Actions/ManualActions1";
// import ManualActions2 from "../Actions/ManualActions2";

const ContainerActions = ({ id, bankName, rawData, setRawData, clientData, setClientData }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "Actions 1", component: (<ManualActions1
          id={id}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          rawData={rawData}
          setRawData={setRawData}
        />
      ),
    },
    // { key: "view2", label: "Actions 2", component: (<ManualActions2
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
  // log id
  // console.log("Client ID ContainerActionsPage:", id);
  // console.log("Bank Name ContainerActionsPage:", bankName);

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
