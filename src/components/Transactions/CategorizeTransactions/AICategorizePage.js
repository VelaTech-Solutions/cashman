import React from "react";


const AICategorizer = () => {
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "/HelpCategory", label: "Category Help", icon: "ph-file-text" },
  ];

  const handleRunAI = () => {
    // Placeholder for future AI logic
    alert("AI Categorization is currently under development. Stay tuned!");
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">AI Transaction Categorizer</h1>

        <p className="text-sm text-gray-400 mb-6">
          This is a work-in-progress AI-driven categorizer. When fully implemented,
          it will automatically analyze and categorize transactions using trained models.
        </p>

        <button
          onClick={handleRunAI}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold"
        >
          🚀 Run AI Categorizer
        </button>
      </div>
    </div>
  );
};

export default AICategorizer;