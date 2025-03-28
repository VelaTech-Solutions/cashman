import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';
import BankCleanRules from "../../../../Rules/BankCleanRules";




function ShowRawData() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [rawData, setRawData] = useState([]); // ✅ Ensure default is an array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);
        setRawData(clientData?.rawData || []); // ✅ Ensure rawData is always an array
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <Table>
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-2 border border-gray-600">#</th>
              <th className="px-4 py-2 border border-gray-600">Raw Data</th>
            </tr>
          </thead>
          <tbody>
            {rawData.length > 0 ? (
              rawData.map((line, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2 text-gray-400">{index + 1}</td>
                  <td className="p-2">{line}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-400">
                  No raw data available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default ShowRawData;
