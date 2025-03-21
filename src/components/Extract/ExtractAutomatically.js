// src/components/ExtractAutomatically.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
import LoadClientData from "components/LoadClientData";
import "styles/tailwind.css";
import ExtractAutomaticActions from "components/Extract/ExtractAutomatic/ExtractAutomaticActions";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ExtractAutomatically() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [extractionStatus, setExtractionStatus] = useState({});
  const [progressData, setProgressData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState("pdfparser");

  const PROCESS_METHODS = { PDF_PARSER: "pdfparser", OCR: "ocr" };

  const totalDebit = clientData?.transactions?.reduce(
    (sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0),
    0
  ).toFixed(2);

  const totalCredit = clientData?.transactions?.reduce(
    (sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0),
    0
  ).toFixed(2);

  const verifiedTransactions = clientData?.transactions?.filter(txn => txn.verified === "✓").length || 0;
  const unverifiedTransactions = clientData?.transactions?.filter(txn => txn.verified === "✗").length || 0;

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

  useEffect(() => {
    if (!id) return;

    const fetchProgress = async () => {
      try {
        const clientRef = doc(db, "clients", id);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          const progress = data.extractProgress || {};
          setProgressData(progress);
        }
      } catch (error) {
        console.error("🔥 Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [id]);

  const combinedStatus = { ...progressData, ...extractionStatus };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Extract Automatically</h1>

      <div className="flex gap-2 mb-4">
        <p className="text-lg font-medium">Processing Bank: {clientData?.bankName || "N/A"}</p>
      </div>

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

      <div className="flex items-center gap-4">
        <ExtractAutomaticActions
          id={clientData?.idNumber}
          bankName={clientData?.bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
          processingMethod={processingMethod}
        />
      </div>

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

      <section className="bg-gray-800 p-3 rounded-md shadow-md mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-gray-900 p-3 rounded-md shadow">
            <p className="text-sm font-bold text-blue-400">Total Credits</p>
            <p className="text-xl font-bold text-white">R {totalCredit}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-md shadow">
            <p className="text-sm font-bold text-blue-400">Total Debits</p>
            <p className="text-xl font-bold text-white">R {totalDebit}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-md shadow">
            <p className="text-sm font-bold text-blue-400">Verified</p>
            <p className="text-xl font-bold text-white">{verifiedTransactions}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-md shadow">
            <p className="text-sm font-bold text-blue-400">Unverified</p>
            <p className="text-xl font-bold text-white">{unverifiedTransactions}</p>
          </div>
        </div>
      </section>

      {/* Mark as Completed Button */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg text-white">
        <h2 className="text-md font-semibold mb-2">Finalize Report</h2>
        {progressData.completed ? (
          <p className="text-green-400 font-semibold">✅ Report marked as completed.</p>
        ) : (
          <button
            onClick={async () => {
              try {
                const clientRef = doc(db, "clients", id);
                await updateDoc(clientRef, {
                  "progress.extracted": true,
                });
                setProgressData((prev) => ({ ...prev, completed: true }));
              } catch (error) {
                console.error("Error updating completion status:", error);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded"
          >
            ✅ Mark Report as Completed
          </button>
        )}
      </div>
    </div>
  );
}

export default ExtractAutomatically;
