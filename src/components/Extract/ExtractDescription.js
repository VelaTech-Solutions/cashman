// src/components/Extract/Extract/ExtractDescription.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import Table from "components/Table"; 
import "styles/tailwind.css";
import bankRules from "./bankRules"; // Import the bank rules
// Firebase Imports
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ExtractDescription() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
   const [columnTypes, setColumnTypes] = useState({});

  // **Updated Regex Patterns**
  // const regex = /(\-?\d*\.\d{2})/g; // Matches amounts (e.g., 1234.56)
  const regex = /^.*$/g; // Matches full description before the first amount

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        if (!clientData) {
          setError("No client data found.");
          return;
        }
  
        setClientData(clientData);
  
        if (!clientData.filteredData || clientData.filteredData.length === 0) {
          setError("No transactions available.");
          return;
        }
  
        const cleanedData = clientData.filteredData.map((line) =>
          typeof line === "string" ? line.replace(/[,*]/g, "").trim() : ""
        );
  
        setTransactions(cleanedData);
        setOriginalTransactions(cleanedData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

  // **Fix: Extract Full Descriptions & Keep Everything Aligned**
  const handleExtractDescription = async () => {
    if (!clientData || !clientData.transactions) {
      setError("Client data is missing. Cannot proceed.");
      return;
    }
  
    const updatedTransactions = transactions.map((transaction, index) => {
      if (typeof transaction !== "string") return transaction;
  
      // **Improved Regex: Capture the full transaction description**
      const match = transaction.match(regex);
      const extractedDescription = match ? match[0].trim() : transaction; // Default to full text if no match
  
      return {
        ...clientData.transactions[index] ?? {}, // Ensure safe access
        description: extractedDescription, // Store extracted description
      };
    });
  
    // **Fix: Ensure cleaned data keeps descriptions intact**
    const cleanedTransactions = transactions.map((transaction) =>
      transaction.replace(regex, "").trim()
    );
  
    try {
      // **Save updated transactions**
      await updateDoc(doc(db, "clients", id), {
        transactions: updatedTransactions,
        filteredData: cleanedTransactions,
      });
  
      setTransactions(updatedTransactions);
      alert("Descriptions extracted successfully!");
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error updating descriptions:", error);
      alert("Failed to extract descriptions.");
    }
  };
  

  const handleColumnTypeChange = (colIndex, type) => {
    setColumnTypes((prev) => {
      const updatedTypes = { ...prev };
  
      // Ensure only one column is "Description"
      if (type === "description") {
        Object.keys(updatedTypes).forEach((key) => {
          if (updatedTypes[key] === "description") {
            delete updatedTypes[key]; // Remove previous selection
          }
        });
      }
  
      updatedTypes[colIndex] = type;
      return updatedTypes;
    });
  
    setSelectedColumn(type ? colIndex : null);
  };
  

  const handleReset = async () => {
    try {
      // Reset to original data
      setTransactions(originalTransactions);
      setColumnTypes({});
      setSelectedRow(null);
      
      await updateDoc(doc(db, "clients", id), { filteredData: originalTransactions });
      alert("Reset successful!");
    } catch (error) {
      console.error("Error resetting transactions:", error);
      alert("Failed to reset data.");
    }
  };

  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md relative">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Extract Descriptions</h2>
        <div>
          <Button text="Extract Descriptions" small onClick={handleExtractDescription} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" />
          <Button text="Reset" small onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" />
        </div>
      </div>
      <Table key={refreshKey}>
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="p-2 border border-gray-600">#</th> {/* Index Column */}
          {transactions.length > 0 && (
            Array.from({
              length: Math.max(
                ...transactions.map((t) =>
                  typeof t === "string" ? t.split(regex).length : 0
                ),
                1
              ),
            }).map((_, colIndex) => (
              <th key={colIndex} className="p-2 border border-gray-600">
                <select
                  className="bg-gray-700 text-white p-1 rounded w-full"
                  value={columnTypes[colIndex] || ""}
                  onChange={(e) => handleColumnTypeChange(colIndex, e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="description">Description</option>
                  {/* Add more options if needed */}
                </select>
              </th>
            ))
          )}
        </tr>
      </thead>

        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={1} className="p-2 border border-gray-600 text-gray-400 text-center">
                No transactions available
              </td>
            </tr>
          ) : (
            transactions.map((transaction, rowIndex) => {
              // Ensure transaction is a string
              const line = typeof transaction === "string" ? transaction : "";
              const descriptionMatch = line.match(regex) || ["No Description Found"];

              return (
                <tr key={rowIndex}  className="border-b border-gray-700">
                  <td className=" p-2 border border-gray-600 text-center">{rowIndex + 1}</td> {/* Index */}
                  <td className="p-2 border border-gray-600 text-green-400 text-center">
                    {descriptionMatch[0]}
                  </td>
                  </tr>
              );
            })
          )}
        </tbody>
      </Table>

    </div>
  );
}

export default ExtractDescription;
