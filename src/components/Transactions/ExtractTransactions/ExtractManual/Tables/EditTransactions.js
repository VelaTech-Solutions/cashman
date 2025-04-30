// src/components/Extract/ExtractManual/EditTransactions.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Components Imports
// import Table, Button from "components/Common"; 
// import Button from "../../Button";
//import LoadClientData from "components/Common/LoadClientData";
import { LoadClientData, Button, Table } from "components/Common";
import BankCleanRules from "../../../../Rules/BankCleanRules";



function EditTransactions() {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [removedTransactions, setRemovedTransactions] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedBank, setSelectedBank] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [ignoredLines, setIgnoredLines] = useState([]);
  const [ignoredCount, setIgnoredCount] = useState(0);
  const [fuzzyMode, setFuzzyMode] = useState(false);
  const [fuzzyIgnoredLines, setFuzzyIgnoredLines] = useState([]);
  const [fuzzyIgnoredCount, setFuzzyIgnoredCount] = useState(0);

  const [showRemoved, setShowRemoved] = useState(true); // 🆕 Always visible

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);

        const cleanedData = (clientData.filteredData || []).map((line) =>
          line.replace(/[,*]/g, "")
        );

        setTransactions(cleanedData);
        setSelectedBank(clientData.bankName || "");

        if (clientData.bankName) {
          const bankRef = doc(db, "banks", clientData.bankName);
          const bankSnapshot = await getDoc(bankRef);
          if (bankSnapshot.exists()) {
            const lines = bankSnapshot.data().ignoredLines || [];
            setIgnoredLines(bankSnapshot.data().ignoredLines || []);
            setFuzzyIgnoredLines(bankSnapshot.data().fuzzyIgnoredLines || []);
            setIgnoredCount(bankSnapshot.data().ignoredLines.length || 0);
            setFuzzyIgnoredCount(bankSnapshot.data().fuzzyIgnoredLines.length || 0);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [clientId]);


  
  
  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="sticky top-0 bg-gray-900 p-2 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Edit Transactions</h2>
      
      {/* <Table>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-2 py-1 w-[10px] border border-gray-600 text-left whitespace-nowrap">#</th>
            <th className="px-2 py-1 w-[10px] border border-gray-600 text-left whitespace-nowrap">Select</th>
            <th className="p-2 border border-gray-600 text-left">Transaction</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">{index + 1}</td>
              <td className="p-2"><input type="checkbox" checked={selectedRows.has(index)} onChange={() => handleToggleRow(index)}/></td>
              <td className="p-2">
                <input 
                  type="text" 
                  value={transaction} 
                  onChange={(e) => handleTransactionChange(index, e.target.value)} 
                  className="w-full bg-transparent border border-gray-600 px-2 py-1 rounded text-white"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table> */}
      <div>
      {/* 🔽 Always Visible: Removed Transactions Section */}
      {/* <div className="mt-6">
        <button
          onClick={() => setShowRemoved(!showRemoved)}
          className="w-full text-left bg-gray-800 text-white p-3 rounded-lg shadow-md flex justify-between"
        >
          <span>Removed Transactions ({removedTransactions.length})</span>
          <span>{showRemoved ? "▲" : "▼"}</span>
        </button>
        {showRemoved && (
          <div className="max-h-[300px] overflow-y-auto border-t border-gray-600 pt-4 mt-2">
            {removedTransactions.length > 0 ? (
              <Table>
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-2 border border-gray-600 text-left">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {removedTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-2 text-red-400">{transaction}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="p-4 text-gray-400">No removed transactions yet.</p>
            )}
          </div>
        )}

      </div> */}
    </div>
    </div>
    </div>

  );
}

export default EditTransactions;


