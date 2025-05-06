import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// Component Imports
import { Loader } from "components/Common";
import ContainerOverViews from "./Containers/ContainerOverViews";
import ContainerTables from "./Containers/ContainerTables";
import { BaseTable } from "./Utils";

const ArchivedData = () => {
  const { id: clientId } = useParams();
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const clientRef = doc(db, "clients", clientId);
        const docSnap = await getDoc(clientRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const archive = data.archive || [];
          setArchiveData(archive);
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error loading archive:", err);
        setError("Failed to fetch archive data.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, [clientId]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex">
      <div className="flex flex-col w-full p-6">
        {/* <h1 className="text-3xl font-bold text-blue-400 mb-6">Archived Transactions</h1> */}

        <ContainerOverViews data={archiveData} />
        <ContainerTables data={archiveData} />

        {/* {archiveData.length > 0 ? (
          <BaseTable data={archiveData} />
        ) : (
          <div className="text-gray-500">No archived transactions found.</div>
        )} */}
      </div>
    </div>
  );
};

export default ArchivedData;
