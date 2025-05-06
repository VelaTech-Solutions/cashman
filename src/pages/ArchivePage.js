import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // adjust path as needed
import "styles/tailwind.css";

// Component Imports
import { Sidebar } from 'components/Common';
import ArchivedData from "../components/ArchivedData/ArchivedData"; // You can uncomment when ready

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
    const fetchArchiveData = async () => {
      try {
        const clientRef = doc(db, "clients", clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          const archiveData = data.archive || [];
          setArchive(archiveData);
        } else {
          setError("Client not found");
        }
      } catch (err) {
        console.error("Error fetching archive data:", err);
        setError("Failed to fetch archive data.");
      }
    };

    fetchArchiveData();
  }, [clientId]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Client Profile" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Manage Archive Data</h1>
        </header>

        {error && <p className="text-red-500">{error}</p>}

        {/* Once you're ready to display it */}
        <ArchivedData archiveData={archive} />

        {/* <div className="mt-6">
          <pre className="bg-gray-900 p-4 rounded text-sm whitespace-pre-wrap">
            {JSON.stringify(archive, null, 2)}
          </pre>
        </div> */}
      </div>
    </div>
  );
};

export default ArchivePage;
