// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Actions/AutomaticActions1.js
import React, { useState, useEffect } from "react";

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import { Button, Table } from "components/Common";
// import { 
//   ExtractionProcess, 
//    } from '../Utils/';


export const ManualActions1 = ({
  id,
  bankName, 
  rawData,
  setRawData,
  clientData,
  setClientData,
  setIsProcessing,
  setExtractionStatus,
}) => {
  const [processing, setProcessing] = useState(false);
  const PROCESS_METHODS = { PDF_PARSER: "pdfparser", OCR: "ocr" };
  const [processingMethod, setProcessingMethod] = useState("pdfparser");

  useEffect(() => {
    if (!id) return;

    const clientRef = doc(db, "clients", id);
    const unsubscribe = onSnapshot(clientRef, (docSnap) => {
      if (docSnap.exists()) {
        // console.log("🔄 Client Data Updated:", docSnap.data());

        if (typeof setClientData === "function") {
          setClientData(docSnap.data()); // ✅ Prevents error
        } else {
          console.warn("⚠️ setClientData is not defined in props");
        }
      }
    });

    return () => unsubscribe();
  }, [id]);



  // reset deletes the following in the db  transactions filteredData extractProgress
  const handlereset = () => {
    if (!id) {
      console.error("❌ Missing client ID");
      return;
    }
  
    const clientRef = doc(db, "clients", id);
    updateDoc(clientRef, {
      transactions: [],
      filteredData: [],
      extractProgress: {},
    });
  
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
  


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
    <div className="flex flex-wrap gap-3">
      {/* <div className="flex items-center gap-2">
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
      <button
        onClick={() =>
          ExtractionProcess({
            id,
            bankName,
            clientData,
            setClientData,
            setProcessing,
            setIsProcessing,
            setExtractionStatus,
          })
        }
        
        className={`bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium ${
          processing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={processing}
      >
        {processing ? "Processing..." : "Extract"}
      </button>

      <button
        onClick={handlereset}
        className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium"
      >
        Reset
      </button>
    </div> */}

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
            {clientData?.bankName && (
              <span className="bg-gray-700 text-white text-sm font-medium px-3 py-1 rounded-lg border border-gray-600">
                Bank: {clientData.bankName}
              </span>
            )}
          </div>
        </div>
    </div>
  );
};

export default ManualActions1;


