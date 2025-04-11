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
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5 rounded-lg shadow-xl text-white text-sm border border-lime-400/20">
        <h2 className="text-lg font-bold mb-4 text-lime-400 tracking-wide animate-pulse">🚀 Extraction Progress</h2>

        {/* 🔥 INSANE Progress Bar */}
        <div className="relative w-full h-5 bg-gray-800 rounded-full overflow-hidden mb-5 shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-400 via-green-300 to-emerald-500 animate-[pulse_1.5s_infinite] transition-all duration-300 ease-in-out rounded-full shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
          {progress === 100 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold animate-ping">
              ✅ Done!
            </div>
          )}
        </div>

        {/* Steps */}
        <ul className="space-y-1 font-mono text-sm">
          {steps.map(([step, status], index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                className={
                  status === "success"
                    ? "text-lime-400"
                    : status === "processing"
                    ? "text-yellow-300"
                    : "text-red-400"
                }
              >
                {status === "success" ? "✅" : status === "processing" ? "⏳" : "❌"}
              </span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExtractProgressView4;
