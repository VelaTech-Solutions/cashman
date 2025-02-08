// src/components/Extract/Extract/ExtractManually.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";

// Extract Components Imports
import ShowRawData from "components/Extract/ShowRawData"; 
import EditTransactions from "components/Extract/EditTransactions"; 
import ShowFilteredData from "components/Extract/ShowFilteredData"; 
import ExtractDates from "components/Extract/ExtractDates";
import ExtractDescription from "components/Extract/ExtractDescription";
import ExtractAmounts from "components/Extract/ExtractAmounts"; 
import VerifyTransactions from "components/Extract/VerifyTransactions"; 
import ViewTransactions from "components/Extract/ViewTransactions"; 


// Firebase Imports 
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";

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

  const [activeTab, setActiveTab] = useState("rawData"); // Default tab

  const tabs = [
    { key: "rawData", label: "View Raw Data" },
    { key: "editData", label: "Edit Transaction Data" },
    { key: "extractDates", label: "Extract Transaction Dates" },
    { key: "extractAmounts", label: "Extract Transaction Amounts" },
    { key: "verifyTransactions", label: "Verify Transaction" },
    { key: "extractDescription", label: "Extract Transaction Description" },
    { key: "debugData", label: "Debug Transaction Data" },
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
            bankName: clientData.bankName,
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }

      const result = await response.json();
      alert(result.message || "Data extracted successfully!");

      // Refresh the page by reloading
      window.location.reload();
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage(
        "An error occurred while extracting data. Please try again.",
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
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Extract Transactions Manually</h1>
      
        <div className="flex gap-2 mb-4">
        {/* <div className="flex items-center justify-between mb-4 w-full"> */}
        {/* Left group: Manual Extract, Delete Extracted Data, and toggles */}
        <div className="flex items-center gap-4">
          {/* Buttons */}
          <Button
            onClick={handleExtractDataManual}
            text={processing ? "Processing..." : "Manual Extract"}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center"
            disabled={processing}
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
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-white shadow  flex justify-start items-center gap-4 text-sm">
          <h3 className="text-lg font-semibold">Summary:</h3>
          <p>Total Transactions: {transactions.length}</p>
          <p>Placeholder 1: Coming soon</p>
          <p>Placeholder 2: Coming soon</p>
        </div>
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
