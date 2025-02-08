// src/components/Extract/Extract/ExtractDates.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import Table from "components/Table"; 

// Firebase Imports
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ExtractDates() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [columnTypes, setColumnTypes] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const regex = /\s+/;

  useEffect(() => {
    

  const fetchData = async () => {
        try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);

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

    const handleExtractDates = async () => {
      if (!clientData?.bankName) {
        setError("Bank name is missing. Cannot proceed.");
        return;
      }
    
      const updatedTransactions = transactions.map((line) => {
        if (typeof line !== "string") return { date1: "", date2: "" };
    
        const segments = line.split(regex); // Split transaction line into words/numbers
        let newData = { date1: "", date2: "" };
    
        Object.entries(columnTypes).forEach(([colIndex, type]) => {
          if (type === "date1" || type === "date2") {
            newData[type] = segments[colIndex] || "";
          }
        });
    
        return {
          original: line, // Preserve original transaction line
          ...newData, // Add extracted dates
        };
      });
    
      try {
        // ✅ Store `date1` and `date2` properly without breaking transaction structure
        await updateDoc(doc(db, "clients", id), { transactions: updatedTransactions });
    
        // ✅ Clean `filteredData` by removing extracted date columns
        const cleanedTransactions = transactions.map(line => {
          if (typeof line !== "string") return line;
          const segments = line.split(regex);
          return segments
            .filter((_, colIndex) => !Object.keys(columnTypes).includes(colIndex.toString()))
            .join(" ")
            .trim();
        });
    
        await updateDoc(doc(db, "clients", id), { filteredData: cleanedTransactions });
    
        setTransactions(cleanedTransactions);
        alert("Dates extracted and saved successfully!");
        
        // Force table refresh
        setRefreshKey((prevKey) => prevKey + 1);
      } catch (error) {
        console.error("Error updating transactions:", error);
        alert("Failed to save dates.");
      }
    };
    
    

    const handleColumnTypeChange = (colIndex, type) => {
        setColumnTypes((prev) => ({ ...prev, [colIndex]: type }));
        setSelectedColumn(type ? colIndex : null);
    };

    const handleDeleteSegment = async (index, colIndex) => {
            const updatedTransactions = [...transactions];
            const segments = updatedTransactions[index].split(regex);
            
            if (segments.length > colIndex) {
            segments.splice(colIndex, 1); // Remove only the specific value
            updatedTransactions[index] = segments.join(" "); // Rejoin remaining values
        
            try {
                await updateDoc(doc(db, "clients", id), { filteredData: updatedTransactions });
                setTransactions(updatedTransactions); // Update state after Firestore update
            } catch (err) {
                console.error("Error updating transactions:", err);
                setError("Failed to update transactions.");
            }
        }
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
        <h2 className="text-lg font-semibold text-white">Extract Dates</h2>
        <div>
          <Button text="Extract Dates" small onClick={handleExtractDates} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" />
          <Button text="Reset" small onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" />
        </div>
      </div>

      <Table key={refreshKey}>
        <thead>
          <tr className="bg-gray-800 text-white">
          <th className="px-2 py-1 w-[10px] border border-gray-600 text-left whitespace-nowrap">#</th> {/* Index Column */}
            {transactions.length > 0 &&
              Array.from({ length: transactions[0].split(regex).length }).map((_, colIndex) => (
                <th key={colIndex} className="p-2 border border-gray-600">
                  <select
                    className="bg-gray-700 text-white p-1 rounded"
                    onChange={(e) => handleColumnTypeChange(colIndex, e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="date1">Date1</option>
                    <option value="date2">Date2</option>
                  </select>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => {
            const segments = typeof transaction === "string" ? transaction.split(regex) : [];
            return (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2">{index + 1}</td> {/* Display Index */}
                {segments.map((segment, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-2 border border-gray-600 relative group transition-colors 
                    ${selectedColumn === colIndex ? "bg-green-900" : ""}`}
                  >
                    {segment}
                    <button
                      className="absolute top-1 right-1 text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteSegment(index, colIndex)}
                    >
                      ✖
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ExtractDates;
