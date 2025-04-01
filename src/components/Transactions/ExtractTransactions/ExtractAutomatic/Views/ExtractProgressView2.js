import React, { useState } from "react";



const ExtractProgressView2 = ({ 
    progressData,
    setProgressData, 
    isProcessing,
    setIsProcessing,
    extractionStatus,
    setExtractionStatus
}) => {

const combinedStatus = { ...progressData, ...extractionStatus };


return (
    <div className="overflow-x-auto">
        <div className="bg-gray-900 p-3 rounded-md shadow mb-3 text-white text-sm">
            <h2 className="text-md font-semibold mb-2">Extraction Progress</h2>
            <ul className="list-none">
            {Object.entries(combinedStatus).map(([step, status], index) => (
                <li key={index} className="flex items-center gap-1">
                <span className={
                    status === "success" ? "text-green-400" :
                    status === "processing" ? "text-yellow-400" : "text-red-400"
                }>
                    {status === "success" ? "✅" : status === "processing" ? "⏳" : "❌"}
                </span>
                {step}
                </li>
            ))}
            </ul>
        </div>
    </div>
    );
};

export default ExtractProgressView2;