// src/components/Extract/Extract/ShowFilteredData.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import Table from "components/Table"; 

// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ShowRawData() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);
        setRawData(clientData.rawData || []);

        const cleanedData = (clientData.filteredData || []).map((line) =>
          line.replace(/[,*]/g, "")
        );

        setTransactions(cleanedData);
        setOriginalTransactions(cleanedData); // Store original data for reset
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleRow = (index) => {
    const updatedSelection = new Set(selectedRows);
    updatedSelection.has(index)
      ? updatedSelection.delete(index)
      : updatedSelection.add(index);
    setSelectedRows(updatedSelection);
  };


  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
      <Table>
        <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-2 border border-gray-600">#</th> {/* Index Column */}
              <th className="px-4 py-2 border border-gray-600">Raw Data</th>
            </tr>
          </thead>
          <tbody>
              {rawData.map((line, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2 text-gray-400">{index + 1}</td> {/* Display Index */}
                <td className="p-2">{line}</td>
              </tr>
              ))}
          </tbody>
        </Table>
    </div>
  );
}

export default ShowRawData;

