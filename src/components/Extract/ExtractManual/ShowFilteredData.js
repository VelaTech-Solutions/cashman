// src/components/Extract/Extract/ShowFilteredData.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import Table from "components/Table"; 
import BankCleanRules from "../../Rules/BankCleanRules";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../firebase/firebase";


function ShowFilteredData() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


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


  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md">
        <Table>
          <tbody>
              {transactions.map((line, index) => (
              <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">{line}</td>
              </tr>
              ))}
          </tbody>
        </Table>
    </div>
  );
}

export default ShowFilteredData;

