import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // To get ID from the URL
import LoadClientData from "../components/LoadClientData"; // Import the fetch function

const ClientData = () => {
  const { id } = useParams(); // Extract ID from the URL
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id); // Call the fetch function
        setClientData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!clientData) return <p>Loading client data...</p>;

  return (
    <div>
      <h1>Client Data</h1>
      <pre>{JSON.stringify(clientData, null, 2)}</pre>
    </div>
  );
};

export default ClientData;
