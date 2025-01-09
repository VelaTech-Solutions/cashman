// src/testpages/testclientprofile.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

const Testclientprofile = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingMethod, setProcessingMethod] = useState("pdfparser"); // Default to PDF Parser

  const PROCESS_METHODS = {
    PDF_PARSER: "pdfparser",
    OCR: "ocr",
  };

  // Fetch client data and files
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientDoc = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          setClientData(clientSnapshot.data());
          const folderRef = ref(storage, `bank_statements/${id}/`);
          const fileList = await listAll(folderRef);
          const urls = await Promise.all(
            fileList.items.map((item) => getDownloadURL(item))
          );
          setFileLinks(urls);
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle processing data for Nedbank
  const handleProcessNedbankData = async () => {
    if (!fileLinks.length) {
      alert("No files found for this client.");
      return;
    }

    try {
      console.log("DEBUG: Starting Nedbank data extraction...");
      console.log("DEBUG: Processing method:", processingMethod);

      // Select the backend function based on the processing method
      const backendFunction =
        processingMethod === PROCESS_METHODS.PDF_PARSER
          ? httpsCallable(functions, "extractTextFromPDF")
          : httpsCallable(functions, "extractTextWithOCR");

      const result = await backendFunction({
        clientId: id,
        fileUrl: fileLinks[0], // Use the first file (adjust as needed)
        bankName: "Nedbank",
      });

      console.log("DEBUG: Backend response:", result.data);
      alert(`Nedbank Data Processed:\n${JSON.stringify(result.data, null, 2)}`);
    } catch (err) {
      console.error("DEBUG: Error processing Nedbank data:", err);
      alert("Failed to process Nedbank data. Please try again.");
    }
  };

  if (loading) return <p>Loading client data and files...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Test Client Profile</h1>

      {/* Client Details */}
      {clientData && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold">
            {clientData.clientName} {clientData.clientSurname}
          </h2>
          <p>ID: {id}</p>
          <p>Bank: {clientData.bankName}</p>
        </div>
      )}

      {/* File Processing Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-2">Extract Transactions</h2>
        <p>Select a method for processing Nedbank transactions:</p>

        {/* Dropdown for method selection */}
        <select
          value={processingMethod}
          onChange={(e) => setProcessingMethod(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded mt-2"
        >
          <option value={PROCESS_METHODS.PDF_PARSER}>PDF Parser</option>
          <option value={PROCESS_METHODS.OCR}>OCR</option>
        </select>

        {/* Process Button */}
        <button
          onClick={handleProcessNedbankData}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4"
        >
          Process Nedbank Data
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex space-x-4 mt-6">
        <Link
          to="/dashboard"
          className="text-blue-400 hover:underline transition"
        >
          Back to Dashboard
        </Link>
        <Link
          to="/testviewclient"
          className="text-blue-400 hover:underline transition"
        >
          Back to Test View Client
        </Link>
      </nav>
    </div>
  );
};

export default Testclientprofile;
