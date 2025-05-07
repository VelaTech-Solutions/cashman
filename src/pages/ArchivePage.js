import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';
import ArchivedData from "../components/ArchivedData/ArchivedData";

const ArchivePage = () => {
  const { id: clientId } = useParams();
  const [archive, setArchive] = useState([]);
  const [error, setError] = useState("");
  
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    { path: "goBack", label: "Back", icon: "ph-arrow-left" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        const archiveData = clientData.archive || [];
        setArchive(archiveData);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Client Profile" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Archive Data</h1>
        </header>
        <ArchivedData archiveData={archive} />
      </div>
    </div>
  );
};

export default ArchivePage;
