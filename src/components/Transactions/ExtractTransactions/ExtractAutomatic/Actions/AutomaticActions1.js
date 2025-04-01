// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Actions/AutomaticActions1.js
import React, { useState, useEffect } from "react";

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import { 
  ExtractionProcess, 
   } from '../Utils/';


export const AutomaticActions1 = ({
  id,
  bankName, 
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
  
  return (
    <div className="flex flex-wrap gap-3">
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
    </div>
  );
};

export default AutomaticActions1;


