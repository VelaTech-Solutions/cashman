import React from "react";

const ExtractProgressView4 = ({
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

  let progress = (completedSteps / totalSteps) * 100;
  const allDone = steps.every(([_, status]) => status === "success");
  if (allDone) progress = 100;

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-lime-400 tracking-wide">Extraction Progress</h2>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-400 via-green-300 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          {progress === 100 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-black bg-white/70 rounded-full">
              ✅ Done!
            </div>
          )}
        </div>

        <ul className="space-y-2 text-sm font-medium">
          {steps.map(([step, status], index) => (
            <li key={index} className="flex items-center gap-3">
              <span
                className={
                  status === "success"
                    ? "text-lime-400"
                    : status === "processing"
                    ? "text-yellow-300"
                    : "text-red-400"
                }
              >
                {status === "success" ? "✔️" : status === "processing" ? "⏳" : "❌"}
              </span>
              <span className="truncate">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExtractProgressView4;
