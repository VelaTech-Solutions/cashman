// src/components/Extract/Extract/ExtractAmounts.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';
import BankCleanRules from "../../../../Rules/BankCleanRules";



function ExtractAmounts() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown Bank");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const regex = /(\s?\-?\d*\.\d{2})/g;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
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
  }, [id]);
  
    // Extract Amounts using bankAmountsRules used t align the amounts
    const extractAmounts = (amounts) => {
      if (!bankName || !bankAmountsRules[bankName]) return amounts;
      return bankAmountsRules[bankName](amounts);
    };
        
    const [columnTypes, setColumnTypes] = useState(["fees_amount", "credit_debit_amount", "balance_amount"]);

    const handleColumnTypeChange = (colIndex, value) => {
      const updatedTypes = [...columnTypes];
      updatedTypes[colIndex] = value;
      setColumnTypes(updatedTypes);
    };
     

    const handleExtractAmounts = async () => {
      const updatedTransactions = transactions.map((txn) => {
        const amountsMatched = [...(txn.extractedOriginal.matchAll(regex))].map((match) =>
          match[0].trim()
        );
    
        const extractedAmounts = extractAmounts(amountsMatched);
    
        // Remove ALL matched amounts from extractedOriginal
        let strippedData = txn.extractedOriginal || "";
        amountsMatched.forEach((amount) => {
          // Use regex with word boundaries to ensure clean replacement
          strippedData = strippedData.replace(new RegExp(`\\s*${amount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g'), ' ').trim();
        });
    
        return {
          ...txn,
          fees_amount: extractedAmounts[0] || null,
          credit_debit_amount: extractedAmounts[1] || null,
          balance_amount: extractedAmounts[2] || null,
          extractedOriginal: strippedData.replace(/\s+/g, ' ').trim(), // Clean up extra spaces
        };
      });
    
      try {
        await updateDoc(doc(db, "clients", id), {
          transactions: updatedTransactions,
        });
    
        setTransactions(updatedTransactions);
        alert("Amounts stored!");
      } catch (err) {
        console.error("Failed to update:", err);
      }
    };
    
    
  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md relative">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Extract Amounts</h2>
        <div>
          <Button text="Extract Amounts" 
            small 
            onClick={handleExtractAmounts} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" 
          />
          <Button text="Reset" 
            small 
            // onClick={handleReset} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" 
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* the option for user to select */}
      {/* <option value="balance_amount">Balance Amounts</option>
      <option value="credit_debit_amount">Credit/Debit Amounts</option>
      <option value="fees_amount">Fees Amounts</option> */}
      
      <Table>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-600 p-2">#</th>
            <th className="border border-gray-600 p-2">Amounts Found</th>
            {[0, 1, 2].map((colIndex) => (
              <th key={colIndex} className="border border-gray-600 p-2">
                <select
                  value={columnTypes[colIndex]}
                  onChange={(e) => handleColumnTypeChange(colIndex, e.target.value)}
                  className="bg-gray-700 text-white rounded p-1"
                >
                  <option value="fees_amount">Fees Amount</option>
                  <option value="credit_debit_amount">Credit/Debit Amount</option>
                  <option value="balance_amount">Balance Amount</option>
                </select>
              </th>
            ))}
            <th className="border border-gray-600 p-2">Original Data</th>
            <th className="border border-gray-600 p-2">Strip Data</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, index) => {
            const amountsMatched = [...(txn.extractedOriginal.matchAll(regex))].map(match => match[0]);
            const alignedAmounts = extractAmounts(amountsMatched);

            return (
              <tr key={index}>
                <td className="border border-gray-600 p-2">{index + 1}</td>
                <td className="border border-gray-600 p-2">{amountsMatched.length > 0 ? amountsMatched.join(" | ") : "—"}</td>

                {/* Individual columns */}
                <td className="p-2 border border-gray-600">{alignedAmounts[0] || "0.00"}</td>
                <td className="p-2 border border-gray-600">{alignedAmounts[1] || "0.00"}</td>
                <td className="p-2 border border-gray-600">{alignedAmounts[2] || "0.00"}</td>

                <td className="border border-gray-600 p-2">{txn.original}</td>
                <td className="border border-gray-600 p-2">{txn.extractedOriginal || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ExtractAmounts;

