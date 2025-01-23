import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import "../styles/tailwind.css";

// components imports
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";
import LoadClientData from "../components/LoadClientData";

// firebase imports
import { doc, getDoc, updateDoc, deleteField, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

function ExtractTransactions() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("manual"); // Track selected extraction type
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
        setClientData(clientData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };

    fetchData();
  }, [id]);

  const handleExtractData = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Example fetch call
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractData",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: id,
            bankName: clientData.bankName,
            method: selectedOption === "manual" ? "Manual" : "Automatic",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      alert("Data extracted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage("An error occurred while extracting data.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar with options */}
      <Sidebar
        title="Dashboard"
        links={[
          { path: "#", label: "Manual Extract", onClick: () => setSelectedOption("manual") },
          { path: "#", label: "Manual Extract", onClick: () => setSelectedOption("manual") },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Extract Transactions</h1>
        </header>

        {/* Conditionally Render Based on Selected Option */}
        {selectedOption === "manual" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-white mb-4">Manual Extraction</h2>
            <Button
              onClick={handleExtractData}
              text={isProcessing ? "Processing..." : "Manual Extract"}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={isProcessing}
            />
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </div>
        )}

        {selectedOption === "automatic" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-white mb-4">Automatic Extraction</h2>
            <Button
              onClick={handleExtractData}
              text={isProcessing ? "Processing..." : "Automatic Extract"}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isProcessing}
            />
            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExtractTransactions;
