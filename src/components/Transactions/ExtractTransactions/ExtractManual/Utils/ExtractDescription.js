// src/components/Extract/Extract/ExtractDescription.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';
import BankCleanRules from "../../../../Rules/BankCleanRules";



function ExtractDescription() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
        if (!data) {
          setError("No client data found.");
          return;
        }
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [id]);

  const handleExtractDescription = async () => {
    const updatedTransactions = transactions.map((txn) => {
      const description = txn.extractedOriginal?.trim() || null;

      return {
        ...txn,
        description,
      };
    });

    try {
      await updateDoc(doc(db, "clients", id), {
        transactions: updatedTransactions,
      });

      setTransactions(updatedTransactions);
      alert("Descriptions stored!");
    } catch (err) {
      console.error("Failed to update descriptions:", err);
      alert("Failed to update descriptions.");
    }
  };

  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md relative">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Extract Descriptions</h2>
        <div>
          <Button
            text="Extract Descriptions"
            small
            onClick={handleExtractDescription}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Table key={refreshKey}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-600 p-2">#</th>
            <th className="border border-gray-600 p-2">Description</th>
            <th className="border border-gray-600 p-2">Original Data</th>
            <th className="border border-gray-600 p-2">Strip Data</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((txn, index) => {
            return (
              <tr key={index}>
                <td className="border border-gray-600 p-2">{index + 1}</td>
                <td className="p-2 border border-gray-600">{txn.description || "—"}</td>
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

export default ExtractDescription;
