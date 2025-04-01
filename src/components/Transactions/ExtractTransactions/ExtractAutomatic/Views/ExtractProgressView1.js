import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ExtractProgressView1 = ({ 
  progressData,
  extractionStatus
}) => {
  const combinedStatus = { ...progressData, ...extractionStatus };

  const stepOrder = [
    "Extract raw data",
    "Clean Statement",
    "Dates Extracted",
    "Verifing Extracted Dates",
    "Amounts Extracted",
    "Verifing Amounts Step 1",
    "Verifing Amounts Step 2",
    "Extracting descriptions",
    "Verifing descriptions"
  ];

  const completedCount = stepOrder.filter(step => combinedStatus[step] === "success").length;

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-900 p-4 rounded-md shadow mb-3 text-white text-sm">
        <div className="w-full h-2 mb-4 bg-gray-700 rounded">
          <div
            className="h-full bg-green-500 rounded transition-all duration-500"
            style={{
              width: `${(completedCount / stepOrder.length) * 100}%`
            }}
          ></div>
        </div>
        <ul className="list-none space-y-2">
          <AnimatePresence>
            {stepOrder.map((step) => {
              const status = combinedStatus[step] || "pending";
              return (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className={
                    status === "success" ? "text-green-400" :
                    status === "processing" ? "text-yellow-400 animate-pulse" :
                    status === "failed" ? "text-red-400" : "text-gray-400"
                  }>
                    {status === "success" ? "✅" :
                     status === "processing" ? "⏳" :
                     status === "failed" ? "❌" : "⬜"}
                  </span>
                  {step}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};

export default ExtractProgressView1;
