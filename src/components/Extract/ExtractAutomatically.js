// src/components/ExtractAutomatically.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import Button from "../Button";
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import ExtractAutomaticActions from "components/Extract/ExtractAutomatic/ExtractAutomaticActions"; // ✅ Linking

// Firebase Imports
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ExtractAutomatically() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);

  // Define state for extraction status
  const [extractionStatus, setExtractionStatus] = useState({});
  const [progressData, setProgressData] = useState({}); // ✅ Extract Progress
  const [showDebug, setShowDebug] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState("pdfparser"); // Default to PDF Parser
  const PROCESS_METHODS = { PDF_PARSER: "pdfparser", OCR: "ocr" };

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        setClientData(clientData);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };

    fetchData();
  }, [id]);

  // Fetch `extractProgress` from Firestore
  useEffect(() => {
    if (!id) return;

    const fetchProgress = async () => {
      try {
        const clientRef = doc(db, "clients", id);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          const progress = data.extractProgress || {}; // ✅ Fetch `extractProgress`
          setProgressData(progress);
        }
      } catch (error) {
        console.error("🔥 Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [id]);

  // Merge Firestore `extractProgress` with `extractionStatus`
  const combinedStatus = { ...progressData, ...extractionStatus };

  if (error) return <div>Error: {error}</div>;

  // Debugging Checklist - Checks if data exists
  const debugChecklist = [
    { label: "Raw Data Exists", value: clientData?.rawData?.length > 0 },
    { label: "Transactions Extracted", value: clientData?.transactions?.length > 0 },
    { label: "Transaction Date 1 Extracted", value: clientData?.transactions?.some(tx => tx.date1) },
    { label: "Transaction Date 2 Extracted", value: clientData?.transactions?.some(tx => tx.date2) },
    { label: "Transaction Descriptions Extracted", value: clientData?.transactions?.some(tx => tx.description) },
    { label: "Transaction Amount Credit Extracted", value: clientData?.transactions?.some(tx => tx.credit_amount) },
    { label: "Transaction Amount Debit Extracted", value: clientData?.transactions?.some(tx => tx.debit_amount) },
    { label: "Transaction Amount Balance Extracted", value: clientData?.transactions?.some(tx => tx.balance_amount) },
    { label: "Transaction Amount Credit or Debit Extracted", value: clientData?.transactions?.some(tx => tx.credit_debit_amount) },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Extract Automatically</h1>

      {/* Bank Name Display */}
      <div className="flex gap-2 mb-4">
        <p className="text-lg font-medium">
          Processing Bank: {clientData?.bankName || "N/A"}
        </p>
      </div>

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

      {/* Extraction Actions */}
      <div className="flex items-center gap-4">
        <ExtractAutomaticActions
          id={clientData?.idNumber}  // ✅ Ensuring correct client ID
          bankName={clientData?.bankName}  // ✅ Ensuring correct Bank Name
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
          processingMethod={processingMethod} // ✅ Properly passed
        />
      </div>

      {/* Debug Toggle */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-500 text-white px-3 py-2 rounded-md mb-2"
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>

      {/* Debugging Checklist */}
      {showDebug && (
        <div className="bg-gray-900 p-3 rounded-md shadow mb-3 text-white text-sm">
          <h2 className="text-md font-semibold mb-2">Debugging Checklist</h2>
          <ul className="grid grid-cols-2 gap-2">
            {debugChecklist.map((item, index) => (
              <li key={index} className="flex items-center gap-1">
                <input type="checkbox" checked={item.value} readOnly className="h-4 w-4 text-green-500" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extraction Progress UI */}
      <div className="bg-gray-900 p-3 rounded-md shadow mb-3 text-white text-sm">
        <h2 className="text-md font-semibold mb-2">Extraction Progress</h2>
        <ul className="list-none">
          {Object.entries(combinedStatus).map(([step, status], index) => (
            <li key={index} className="flex items-center gap-1">
              <span className={
                status === "success" ? "text-green-400" :
                status === "processing" ? "text-yellow-400" : "text-red-400"
              }>
                {status === "success" ? "✅" : status === "processing" ? "⏳" : "❌"}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>


      {/* display transaction for debuging */}
{/* Transactions Table */}  
<section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
  {clientData?.transactions?.length > 0 ? (
    <div className="overflow-y-auto h-96">
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-sm">Date1</th>
            <th className="px-4 py-2 text-sm">Date2</th>
            <th className="px-4 py-2 text-sm">Description</th>
            <th className="px-4 py-2 text-sm">Fee Type</th>
            <th className="px-4 py-2 text-sm">Fee Amount</th>
            <th className="px-4 py-2 text-sm">Credit Amount</th>
            <th className="px-4 py-2 text-sm">Debit Amount</th>
            <th className="px-4 py-2 text-sm">Balance Amount</th>
          </tr>
        </thead>
        <tbody>
          {clientData.transactions.map((transaction, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="px-4 py-2 text-sm">{transaction.date1 || "N/A"}</td>
              <td className="px-4 py-2 text-sm">{transaction.date2 || "N/A"}</td>
              <td className="px-4 py-2 text-sm">{transaction.description || "N/A"}</td>
              <td className="px-4 py-2 text-sm">{transaction.fees_type || "N/A"}</td>
              <td className="px-4 py-2 text-sm">
                {typeof transaction.fees_amount}
              </td>
              <td className="px-4 py-2 text-sm">
                {typeof transaction.credit_amount === "number"
                  ? `R ${transaction.credit_amount.toFixed(2)}`
                  : "R 0.00"}
              </td>
              <td className="px-4 py-2 text-sm">
                {typeof transaction.debit_amount === "number"
                  ? `R ${transaction.debit_amount.toFixed(2)}`
                  : "R 0.00"}
              </td>
              <td className="px-4 py-2 text-sm">
                {typeof transaction.balance_amount === "number"
                  ? `R ${transaction.balance_amount.toFixed(2)}`
                  : "R 0.00"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-lg text-gray-500">No transactions found.</p>
  )}
</section>


    </div>
  );
}

export default ExtractAutomatically;
