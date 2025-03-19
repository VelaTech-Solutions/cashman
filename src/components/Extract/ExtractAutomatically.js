// src/components/ExtractAutomatically.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components Imports
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
      {/* display transaction with 0.00 only for debuging */}
      {/* <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
        {clientData?.transactions?.length > 0 ? (
            <div className="overflow-y-auto h-96">
              <table className="table-auto w-full border-collapse">
                <thead>
                </thead>
                  <tbody>
                    {clientData.transactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-700 text-white">
                        <td className="px-6 py-3">{index + 1}</td>
                      </tr>
                    ))}
                  </tbody>
              </table>
              </div>
              ) : (
              <p className="text-center text-lg text-gray-500">No error on transactions found.</p>
              )}
        </section> */}


{/* Debugging: Transactions where balance, credit, and debit are all 0.00 */}
<section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-white mb-2">Edit Transactions</h2>

  {clientData?.transactions?.length > 0 ? (
    <div className="overflow-y-auto h-96">
      <table className="table-auto w-full border-collapse text-white">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-6 py-3 text-left">Index</th>
            <th className="px-6 py-3 text-left">verified</th>
            <th className="px-6 py-3 text-left">Credit/Debit</th>
            <th className="px-6 py-3 text-left">Credit</th>
            <th className="px-6 py-3 text-left">Debit</th>
            <th className="px-6 py-3 text-right">Balance Amount</th>
          </tr>
        </thead>
        <tbody>
          {clientData.transactions
            .filter((tx) => {
              const creditdebit = parseFloat(tx.credit_debit_amount || "0").toFixed(2);
              const credit = parseFloat(tx.credit_amount || "0").toFixed(2);
              const debit = parseFloat(tx.debit_amount || "0").toFixed(2);
              return credit === "0.00" && debit === "0.00";
            })
            .map((transaction, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="px-6 py-3">{index + 1}</td>
                <td className="px-6 py-3 text-left">{transaction.verified}</td>
                <td className="px-6 py-3 text-right">R {parseFloat(transaction.credit_debit_amount || "0").toFixed(2)}</td>
                <td className="px-6 py-3 text-right">R {parseFloat(transaction.credit_amount || "0").toFixed(2)}</td>
                <td className="px-6 py-3 text-right">R {parseFloat(transaction.debit_amount || "0").toFixed(2)}</td>
                <td className="px-6 py-3 text-right">R {parseFloat(transaction.balance_amount || "0").toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-lg text-gray-500">No transactions with 0.00 found.</p>
  )}
</section>
      {/* display transaction for debuging */}
      {/* Transactions Table for debugging remove later */}
      <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
        {clientData?.transactions?.length > 0 ? (
          <div className="overflow-y-auto h-96">
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900 text-white">
                  <th className="px-6 py-3 text-left">Index</th>
                  <th className="px-6 py-3 text-left">verified</th>
                  <th className="px-6 py-3 text-left">Fee Type</th>
                  <th className="px-6 py-3 text-right">Fee Amount</th>
                  <th className="px-6 py-3 text-right">Credit/Debit</th>
                  <th className="px-6 py-3 text-right">Credit Amount</th>
                  <th className="px-6 py-3 text-right">Debit Amount</th>
                  <th className="px-6 py-3 text-right">Balance Amount</th>
                </tr>
              </thead>
              <tbody>
                {clientData.transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-700 text-white">
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3 text-left">{transaction.verified}</td>
                    <td className="px-6 py-3">{transaction.fees_type || "N/A"}</td>
                    <td className="px-6 py-3 text-right">
                    {transaction.fees_amount && !isNaN(transaction.fees_amount)
                        ? `R ${parseFloat(transaction.fees_amount).toFixed(2)}`
                        : "R 0.00"}
                    </td>
                    <td className="px-6 py-3 text-right">
                    {transaction.credit_debit_amount && !isNaN(transaction.credit_debit_amount)
                        ? `R ${parseFloat(transaction.credit_debit_amount).toFixed(2)}`
                        : "R 0.00"}
                    </td>
                    <td className="px-6 py-3 text-right">
                    {transaction.credit_amount && !isNaN(transaction.credit_amount)
                        ? `R ${parseFloat(transaction.credit_amount).toFixed(2)}`
                        : "R 0.00"}
                    </td>
                    <td className="px-6 py-3 text-right">
                    {transaction.debit_amount && !isNaN(transaction.debit_amount)
                        ? `R ${parseFloat(transaction.debit_amount).toFixed(2)}`
                        : "R 0.00"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {transaction.balance_amount && !isNaN(transaction.balance_amount)
                        ? `R ${parseFloat(transaction.balance_amount).toFixed(2)}`
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
