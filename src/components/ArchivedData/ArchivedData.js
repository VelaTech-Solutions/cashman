import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import { LoadClientData } from "components/Common";
import OverViews from "./OverViews/OverView";
import Tables from "./Tables/Table";

const ArchivedData = () => {
  const { id: clientId } = useParams();
  const [archiveData, setArchive] = useState([]);
  const [error, setError] = useState("");

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

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex">
      <div className="flex flex-col w-full p-6">
        <OverViews data={archiveData} />
        <Tables data={archiveData} />
      </div>
    </div>
  );
};

export default ArchivedData;
