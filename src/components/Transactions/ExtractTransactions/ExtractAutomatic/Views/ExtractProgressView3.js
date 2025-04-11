import React from "react";

const ExtractProgressView3 = ({
  progressData,
  setProgressData,
  isProcessing,
  setIsProcessing,
  extractionStatus,
  setExtractionStatus,
}) => {
  const combinedStatus = { ...progressData, ...extractionStatus };

  const steps = Object.entries(combinedStatus);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(([_, status]) => status === "success").length;

  // Calculate percentage
  let progress = (completedSteps / totalSteps) * 100;

  // Force 100% if all shown steps are done (optional safety cap)
  const allDone = steps.every(([_, status]) => status === "success");
  if (allDone) progress = 100;

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-900 p-4 rounded-md shadow text-white text-sm">
        <h2 className="text-md font-semibold mb-3">Extraction Progress</h2>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-green-400 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress steps */}
        <ul className="list-none space-y-1">
          {steps.map(([step, status], index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                className={
                  status === "success"
                    ? "text-green-400"
                    : status === "processing"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {status === "success" ? "✅" : status === "processing" ? "⏳" : "❌"}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExtractProgressView3;
