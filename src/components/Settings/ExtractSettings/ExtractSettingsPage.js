// src/pages/ExtractSettings.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Component Imports
import { Sidebar } from 'components/Common';
import ContainerViews from "./Containers/ContainerViews";
import ContainerOverViews from "./Containers/ContainerOverViews";



function ExtractSettingsPage() {
  const [viewMode, setViewMode] = useState("overview1");
  const [error, setError] = useState(null);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "goBack", label: "Back", icon: "ph-arrow-left" },
    { path: "/HelpExtract", label: "Extract Help", icon: "ph-question" },
  ];

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Extract Settings" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Extract Settings</h2>
        <ContainerViews setViewMode={setViewMode} viewMode={viewMode} />
      </div>
    </div>
  );
}

export default ExtractSettingsPage;
