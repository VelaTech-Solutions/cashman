// src/pages/ExtractSettings.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Component Imports
import { Sidebar } from 'components/Common';
import MainSettings from "../components/Settings/MainSettings/Containers/ContainerViews";
import FilterSettings from "../components/Settings/FilterSettings/Containers/ContainerViews";
import CategorySettings from "../components/Settings/CategorySettings/Containers/ContainerViews";
import ExtractSettings from "../components/Settings/ExtractSettings/Containers/ContainerViews";
// import EditSettings from "../components/Settings/EditSettings/EditSettings";
// import ViewSettings from "../components/Settings/ViewSettings/ViewSettings";

// import ContainerViews from "./Containers/ContainerViews";
// import ContainerOverViews from "./Containers/ContainerOverViews";



function SettingsPage() {
  const [viewMode, setViewMode] = useState("mainSettings");
  const [error, setError] = useState(null);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "goBack", label: "Back", icon: "ph-arrow-left" },
    { path: "/HelpExtract", label: "Extract Help", icon: "ph-question" },
  ];

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Settings" links={links} />
      {/*  */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        
        {/* Button Group for Navigation */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setViewMode("mainSettings")}
            className={`px-4 py-2 rounded ${viewMode === "mainSettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            Main Settings
          </button>
          <button 
            onClick={() => setViewMode("categorySettings")}
            className={`px-4 py-2 rounded ${viewMode === "categorySettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            Category Settings
          </button>
          <button
            onClick={() => setViewMode("filterSettings")}
            className={`px-4 py-2 rounded ${viewMode === "filterSettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            Filter Settings
          </button>
          <button 
            onClick={() => setViewMode("extractSettings")}
            className={`px-4 py-2 rounded ${viewMode === "extractSettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            Extract Settings
          </button>
          <button 
            onClick={() => setViewMode("editSettings")}
            className={`px-4 py-2 rounded ${viewMode === "editSettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            Edit Settings
          </button>
          <button 
            onClick={() => setViewMode("viewSettings")}
            className={`px-4 py-2 rounded ${viewMode === "viewSettings" ? "bg-blue-500" : "bg-gray-700"}`}
          >
            View Settings
          </button>
        </div>
        
        {/* Conditional Rendering Based on Active Section */}
        {viewMode === "mainSettings" && <MainSettings />}
        {viewMode === "filterSettings" && <FilterSettings />}
        {viewMode === "categorySettings" && <CategorySettings />}
        {viewMode === "extractSettings" && <ExtractSettings />}
        {viewMode === "editSettings" && <EditSettings />}
        {viewMode === "viewSettings" && <ViewSettings />}
      </div>
    </div>
  );
}

export default SettingsPage;