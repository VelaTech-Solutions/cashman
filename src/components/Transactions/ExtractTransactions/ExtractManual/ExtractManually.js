// src/components/Extract/Extract/ExtractManually.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports 
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage, auth } from "../../../../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';

// Extract Components Imports
import ShowRawData from "./Tables/ShowRawData"; 
import EditTransactions from "./Tables/EditTransactions"; 
import ShowFilteredData from "./Tables/ShowFilteredData"; 
import ViewTransactions from "./Tables/ViewTransactions"; 
import ExtractDates from "./Utils/ExtractDates";
import ExtractDescription from "./Utils/ExtractDescription";
import ExtractAmounts from "./Utils/ExtractAmounts"; 
import VerifyTransactions from "./Utils/VerifyTransactions"; 





function ExtractManually() {

  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [processingMethod, setProcessingMethod] = useState("pdfparser"); // Default to PDF Parser
  const PROCESS_METHODS = {
    PDF_PARSER: "pdfparser",
    OCR: "ocr",
  };

  const [activeTab, setActiveTab] = useState("editData"); // Default tab

  const tabs = [

    { key: "editData", label: "Edit Transaction Data Step 1" },
    { key: "extractDates", label: "Extract Transaction Dates Step 2" },
    { key: "extractAmounts", label: "Extract Transaction Amounts Step 3" },
    { key: "extractDescription", label: "Extract Transaction Description Step 4" },
    { key: "verifyTransactions", label: "Verify Transaction Step 5" },
    // { key: "rawData", label: "View Raw Data" },
    // { key: "debugData", label: "Debug Transaction Data" },
    { key: "viewTransactions", label: "View Structured Transactions" },
  ];
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        
        setClientData(clientData);
        setRawData(clientData.rawData || []);
  
        // Data cleaning: Remove "," and "*" from filteredData
        const cleanedData = (clientData.filteredData || []).map(line =>
          line.replace(/[,*]/g, "") // Remove commas and asterisks
        );
  
        setTransactions(cleanedData);
  
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  
  // Handle data extraction Manually
  const handleExtractDataManual = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }
  
    setProcessing(true);
    setErrorMessage("");
  
    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: id,
            bankName: clientData.bankName || "Unknown",
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
  
      const result = await response.json();
      alert(result.message || "Data extracted successfully!");
  
      // Refresh data or reload
      if (typeof fetchClientData === "function") {
        await fetchClientData();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage(
        `An error occurred while extracting data: ${error.message}. Please try again.`
      );
    } finally {
      setProcessing(false);
    }
  };
  // Function to handle deletion of extracted data
  const handleDeleteExtractedData = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete all extracted data? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      // Reference the Firestore document for this client using the ID
      const clientRef = doc(db, "clients", id);

      // Remove the specific fields from the document
      await updateDoc(clientRef, {
        rawData: deleteField(),
        transactions: deleteField(),
        number_of_transactions: deleteField(),
        filteredData: deleteField(),
      });

      alert("Extracted data deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting extracted data:", error);
      alert("Failed to delete extracted data. Please try again.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">
        Extract Manually
        </h1>
      
        <div className="flex gap-2 mb-4">
          <div className="flex items-center gap-4">

            <Button
              onClick={handleExtractDataManual}
              text={processing ? "Processing..." : "Manual Extract"}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center"
              disabled={processing || (rawData && rawData.length > 0)} // Assuming rawData is an array
            />

            <Button
              onClick={handleDeleteExtractedData}
              text="Delete Extracted Data"
              className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium text-center"
            />

            {/* OCR Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">PDF Parser</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={processingMethod === PROCESS_METHODS.OCR}
                  onChange={(e) =>
                    setProcessingMethod(
                      e.target.checked ? PROCESS_METHODS.OCR : PROCESS_METHODS.PDF_PARSER
                    )
                  }
                />
                <div className="w-10 h-5 bg-gray-400 rounded-full peer-checked:bg-blue-600 transition relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
              <span className="text-white text-sm">OCR</span>
            </div>

            {/* Bank Name Display */}
            {clientData?.bankName && (
              <span className="bg-gray-700 text-white text-sm font-medium px-3 py-1 rounded-lg border border-gray-600">
                Bank: {clientData.bankName}
              </span>
            )}
          </div>

          {/* Right group: Compact Summary Bar */}
          {/* <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white shadow  flex justify-start items-center gap-4 text-sm">
            <h3 className="text-lg font-semibold">Summary:</h3>
            <p>Total Transactions: {transactions.length}</p>
            <p>Placeholder 1: Coming soon</p>
            <p>Placeholder 2: Coming soon</p>
          </div> */}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              text={tab.label}
              small
              className={activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}
            />
          ))}
        </div>
        {activeTab === "rawData" && <ShowRawData />}
        {activeTab === "editData" && <EditTransactions />}
        {activeTab === "extractDates" && <ExtractDates />}
        {activeTab === "extractAmounts" && <ExtractAmounts />}
        {activeTab === "extractDescription" && <ExtractDescription />}
        {activeTab === "verifyTransactions" && <VerifyTransactions />}
        {activeTab === "debugData" && <ShowFilteredData />}
        {activeTab === "viewTransactions" && <ViewTransactions />}
      </div>
  );
}

export default ExtractManually;
