import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import BankDatesRules from "./BankDatesRules";

const ExtractDates = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientDoc = await getDoc(doc(db, "clients", id));
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setTransactions(data.transactions || []);
        } else {
          setError("Client data not found.");
        }
      } catch (err) {
        setError("Error loading transactions.");
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // const handleExtractAndSaveDates = async () => {
  //   const updatedTransactions = transactions.map((txn) => {
  //     const bankRule = BankDatesRules[txn.bankName] || (() => []);
  //     const extractedDates = bankRule(txn.original || "");

  //     let date1 = null;
  //     let date2 = null;

  //     if (extractedDates.length === 1) {
  //       date1 = extractedDates[0];
  //       date2 = extractedDates[1];
  //     } else if (extractedDates.length >= 2) {
  //       date1 = extractedDates[0];
  //       date2 = extractedDates[1];
  //     }

  //     return { ...txn, date1, date2 };
  //   });

  //   try {
  //     const clientRef = doc(db, "clients", id);
  //     await updateDoc(clientRef, { transactions: updatedTransactions });

  //     setTransactions(updatedTransactions);
  //     setSuccess("Dates extracted and saved successfully!");
  //   } catch (err) {
  //     setError("Failed to update transactions.");
  //     console. error(err);
  //   }
  // };
  // Process each transaction using its original text for date extraction
  const matchTransactions = transactions.map((txn) => {
    // Use the bank-specific rule based on the transaction's bankName;
    // if not found, return an empty array
    const bankRule = BankDatesRules[txn.bankName] || (() => []);
    // Apply the rule on the transaction's original data (using an empty string fallback)
    const extractedDates = bankRule(txn.original || "");
    console.log(`Transaction "${txn.original}" -> Matched Dates: ${extractedDates.join(", ") || "No Match"}`);

    return { ...txn, extractedDates };
  });


  return (
    <div className="p-4 bg-gray-900 text-white">
      
      <h2 className="text-lg font-semibold">Extract Dates</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <button
        // onClick={handleExtractAndSaveDates}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Extract Dates
      </button>

      <table className="w-full mt-4 border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">Original</th>
            <th className="p-2">Date 1</th>
            <th className="p-2">Date 2</th>
          </tr>
        </thead>
        <tbody>
          {matchTransactions.map((txn, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="p-2">{txn.original || "-"}</td>
              <td className={`p-2 ${txn.date1 ? "text-green-400" : "text-red-400"}`}>
                {txn.date1 || "No Date"}
              </td>
              <td className={`p-2 ${txn.extractedDates.length ? "text-green-400" : "text-red-400"}`}>
                {txn.extractedDates.length ? txn.extractedDates.join(", ") : "No Match"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExtractDates;
