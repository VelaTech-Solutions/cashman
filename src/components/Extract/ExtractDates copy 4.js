//src/components/Extract/ExtractDates.js
import React, { useEffect, useState, useMemo  } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import BankDatesRules from "./BankDatesRules";
import Table from "components/Table"; 
import LoadClientData from "components/LoadClientData";

// Firebase Imports
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ExtractDates = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown Bank");
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // const BankDatesRules = {
//   "Absa Bank": (text) => text.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g) || [],
//   "Capitec Bank": (text) => text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [],
//   "Fnb Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g) || [],
//   "Ned Bank": (text) => text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [],
//   "Standard Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}\b/g) || [],
//   "Tyme Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\b/g) || [],
// };
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const clientDoc = await getDoc(doc(db, "clients", id));
  //       if (clientDoc.exists()) {
  //         const data = clientDoc.data();
  //         setTransactions(data.transactions || []);
  //       } else {
  //         setError("Client data not found.");
  //       }
  //     } catch (err) {
  //       setError("Error loading transactions.");
  //       console.error(err);
  //     }
  //   };

  //   fetchData();
  // }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        if (!clientData) {
          setError("No client data found.");
          return;
        }
        console.log(`Bank Name: ${clientData.bankName || "Unknown Bank"}`);
        setBankName(clientData.bankName || "Unknown Bank");

        setClientData(clientData);
        // transactions.origial
        setTransactions(clientData.transactions || []);

        // transactions.origial
        // setOriginalTransactions(clientData);
        // log
        // console.log(`Original line: ${clientData.original || "Null"}`);
        // setOriginalTransactions(clientData.original || "Null");
          // Compute original transactions with useMemo
  const originalTransactions = useMemo(() => {
    return clientData?.transactions?.filter(
      transaction => transaction.original != null
    ) || [];
  }, [clientData]);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
  
    fetchData();
  }, [id]);
  // Fecth original transactions
  // const originalTransactions = useMemo(() => {
  //   return clientData?.transactions?.filter(
  //     transaction => transaction.original != null
  //   ) || [];
  // }, [clientData]);
  

// use the BankDatesRules to first display the dates found in the data
// const matchTransactions = transactions.map((txn) => {
//   const extractedDates = txn.BankName in BankDatesRules ? 
//     BankDatesRules[txn.BankName].dates : [];
//   console.log(`Bank Name: ${txn.BankName}`);
//   console.log(`Matched Dates:`);
//   if (extractedDates.length > 0) {
//     console.log(extractedDates.map(date => date.toString()).join(', '));
//   } else {
//     console.log('No dates found');
//   }
//   return { ...txn, extractedDates };
// });
  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Extract Dates</h2>
        <div>
          <Button text="Extract Dates" 
          small 
          //onClick={handleExtractAndSaveDates} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" 
          />
          <Button text="Reset" 
          small 
          //onClick={handleReset} 
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2" 
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* <button
        onClick={handleExtractAndSaveDates}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Extract Dates
      </button> */}

      {/* display the transactions */}
      
      <Table>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 border border-gray-600">#</th>
            <th className="px-4 py-2 border border-gray-600">Data</th>
            {/* display date1 and date2 if found */}
            <th className="px-4 py-2 border border-gray-600">Date 1</th>
            <th className="px-4 py-2 border border-gray-600">Date 2</th>

          </tr>
        </thead>
          {/* <tbody>
            {transactions.length > 0 ? (
              <ul>
                {transactions.map((txn, index) => (
                  
                  <li key={index}>{txn.original}</li>
                ))}
              </ul>
            ) : (
              <p>No transactions found.</p>
            )}
          </tbody> */}

          {/* <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2 text-gray-400">{index + 1}</td>
                  <td className="p-2">{txn.original}</td>
                  
                  <td className="p-2">{txn.extractedDates.date1}</td>
                  <td className="p-2">{txn.extractedDates.date2}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody> */}
        </Table>
    </div>
  );
};

export default ExtractDates;

