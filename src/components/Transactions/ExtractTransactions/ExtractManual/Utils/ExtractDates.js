// src/components/Extract/ExtractDates.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';
import BankCleanRules from "../../../../Rules/BankCleanRules";




const ExtractDates = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown Bank");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("No client data found.");
          return;
        }
        setBankName(data.bankName || "Unknown Bank");
        setClientData(data);
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
  
    fetchData();
  }, [clientId]);

  // Extract dates using BankDatesRules
  const extractDates = (text) => {
    if (!bankName || !BankDatesRules[bankName]) return [];
    return BankDatesRules[bankName](text);
  };

 

  const handleExtractDates = async () => {
    const updatedTransactions = transactions.map(txn => {
      const extractedDates = extractDates(txn.original || "");
      // console.log(`Original: ${txn.original}`);
      // console.log(`Extracted Dates: ${extractedDates}`);
      let strippedData = txn.original || "";

      extractedDates.forEach(date => {
        strippedData = strippedData.replace(date, "").trim();
      });
  
      return {
        ...txn,
        date1: extractedDates[0] || null,
        date2: extractedDates[1] || null,
        extractedOriginal: strippedData,
      };
    });
  
    console.log("Final Transactions with Dates:", updatedTransactions);
  
    try {
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updatedTransactions,
      });
  
      setTransactions(updatedTransactions);
      alert("Dates stored!");
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };
   
  
  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Extract Dates</h2>
        <div>
          <Button 
            text="Extract Dates" 
            small 
            onClick={handleExtractDates} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" 
          />
          <Button 
            text="Reset" 
            small 
            //onClick={handleReset} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" 
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <Table>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 border border-gray-600">#</th>
            <th className="px-4 py-2 border border-gray-600">Date 1 Found</th>
            <th className="px-4 py-2 border border-gray-600">Date 2 Found</th>
            <th className="px-4 py-2 border border-gray-600">Original Data</th>
            <th className="px-4 py-2 border border-gray-600">Strip Data</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((txn, index) => {
              const extractedDates = extractDates(txn.original || "");

              return (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2 text-gray-400">{index + 1}</td>
                  <td className="p-2 border border-gray-600 text-green-400">{extractedDates[0] || "-"}</td>
                  <td className="p-2 border border-gray-600 text-green-400">{extractedDates[1] || "-"}</td>
                  <td className="p-2">{txn.original}</td>
                  <td className="p-2">{txn.extractedOriginal || "No extracted data"}</td>

                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-400">
                No transactions found.              
                </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ExtractDates;



