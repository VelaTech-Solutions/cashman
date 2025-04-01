// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Containers/ContainerVeiws.js
import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import ExtractProgressView1 from "../Views/ExtractProgressView1";
import ExtractProgressView2 from "../Views/ExtractProgressView2";


const ContainerVeiws = ({ 
    progressData,
    setProgressData, 
    isProcessing,
    setIsProcessing,
    extractionStatus,
    setExtractionStatus
 }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    { key: "view1", label: "", Component: <ExtractProgressView1 
        progressData={progressData || []}
        setProgressData={setProgressData} 
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        extractionStatus={extractionStatus}
        setExtractionStatus={setExtractionStatus}
         /> },
    { key: "view2", label: "", Component: <ExtractProgressView2 
        progressData={progressData || []} 
        isProcessing={isProcessing}
        setProgressData={setProgressData}
        setIsProcessing={setIsProcessing}
        extractionStatus={extractionStatus}
        setExtractionStatus={setExtractionStatus}
        /> },
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

export default ContainerVeiws;

