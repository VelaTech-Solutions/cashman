// src/components/Extract/Extract/ExtractAmounts.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import bankRules from "./bankRules"; // Import the bank rules
import Table from "components/Table"; 

// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ExtractAmounts() {
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


  const regex = /(\-?\d*\.\d{2})/g;

  const [bankName, setBankName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);
  
        // Ensure bank name exists and is properly formatted
        const formattedBankName = clientData.bankName ? clientData.bankName.trim() : "Unknown Bank";
        setBankName(formattedBankName);
  
        const cleanedData = (clientData.filteredData || []).map((line) =>
          line.replace(/[,*]/g, "")
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
  
  const handleExtractAmounts = async () => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }
  
    const updatedTransactions = transactions.map((transaction, index) => {
      if (typeof transaction !== "string") return transaction;
  
      // Extract amounts using regex
      let amounts = [...transaction.matchAll(regex)].map(match => parseFloat(match[0])); // Convert to numbers
  
      // Apply bank-specific formatting if available
      const formatAmounts = bankRules[bankName] || ((a) => a);
      amounts = formatAmounts(amounts);
  
      // Preserve existing dates if available
      let categorizedAmounts = {
        balance_amount: amounts.length >= 3 ? amounts[2] : null,
        credit_debit_amount: amounts.length >= 2 ? amounts[1] : null,
        // credit_amount: amounts.length >= 2 ? amounts[1] : null,
        fees_type: null,
        fees_amount: amounts.length >= 1 ? amounts[0] : null,
        date1: clientData.transactions[index]?.date1 || null,  // Keep date1
        date2: clientData.transactions[index]?.date2 || null,  // Keep date2
        description: clientData.transactions[index]?.description || null,  // Keep description
      };
  
      return {
        ...clientData.transactions[index], // Preserve transaction details
        ...categorizedAmounts, 
      };
    });
  
    try {
      // ✅ Update only amounts, keeping date fields intact
      await updateDoc(doc(db, "clients", id), {
        transactions: updatedTransactions
      });
  
      // ✅ Preserve `filteredData`, removing only extracted amounts while keeping dates
      const cleanedTransactions = transactions.map(line => {
        if (typeof line !== "string") return line;
        return line.replace(regex, "").trim(); // Remove extracted amounts only
      });
  
      await updateDoc(doc(db, "clients", id), {
        filteredData: cleanedTransactions  // Keeps other fields intact
      });
  
      setTransactions(updatedTransactions);
      alert("Amounts extracted and categorized successfully!");
  
      // Force table refresh
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error updating transactions:", error);
      alert("Failed to extract amounts.");
    }
  };
  
  
  const handleColumnTypeChange = (colIndex, type) => {
    setColumnTypes((prev) => ({ ...prev, [colIndex]: type }));
    setSelectedColumn(type ? colIndex : null);
  };

  const handleDeleteSegment = async (rowIndex, colIndex) => {
    const updatedTransactions = [...transactions];
    let segments = updatedTransactions[rowIndex].split(regex);
  
    if (segments.length > colIndex) {
      segments[colIndex] = ""; // Instead of splicing, replace with an empty string
      updatedTransactions[rowIndex] = segments.join(" ").trim(); 
  
      try {
        await updateDoc(doc(db, "clients", id), { filteredData: updatedTransactions });
        setTransactions(updatedTransactions);
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
        <h2 className="text-lg font-semibold text-white">Extract Amounts</h2>
        <div>
          {/* Button to verify amounts  */}
          <Button text="Extract Amounts" small onClick={handleExtractAmounts} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" />
          <Button text="Reset" small onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" />
          {/*  */}
        </div>
      </div>

      <Table key={refreshKey}>
        <thead>
          <tr className="bg-gray-800 text-white">
          <th className="px-2 py-1 w-[10px] border border-gray-600 text-left whitespace-nowrap">#</th> {/* Index Column */}
            {transactions.length > 0 &&
              Array.from({ length: typeof transactions[0] === "string" ? transactions[0].split(regex).length : 1 }).map((_, colIndex) => (
                <th key={colIndex} className="p-2 border border-gray-600">
                  <select
                    className="bg-gray-700 text-white p-1 rounded"
                    onChange={(e) => handleColumnTypeChange(colIndex, e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="balance_amount">Balance Amounts</option>
                    <option value="credit_debit_amount">Credit Debit Amounts</option>
                    <option value="fees_amount">Fees Amounts</option>
                  </select>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((line, rowIndex) => {
            let amounts = typeof line === "string" ? [...line.matchAll(regex)].map(match => match[0]) : [];
            const formatAmounts = bankRules[bankName] || ((a) => a);
            amounts = formatAmounts(amounts);

            return (
              <tr key={rowIndex} className="border-b border-gray-700">
                <td className="p-2">{rowIndex + 1}</td> {/* Display Index */}
                {amounts.length > 0 ? (
                  amounts.map((amount, colIndex) => (
                    <td key={colIndex} className="p-2 border border-gray-600 text-green-400 text-center">
                      {amount}
                      
                    </td>
                  ))
                ) : (
                  <td colSpan="5" className="p-2 border border-gray-600 text-gray-400 text-center">
                    N/A
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ExtractAmounts;

