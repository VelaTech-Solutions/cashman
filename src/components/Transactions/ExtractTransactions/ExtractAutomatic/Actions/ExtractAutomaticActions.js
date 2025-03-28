// src/components/Extract/ExtractAutomaticActions.js
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Local JS scripts for in-app extraction
import cleanStatement from "../Utils/cleanStatement"; // 🚧 Commented out for now
import createDatabaseStructure from "../Utils/createDatabaseStructure";
import extractDates from "../Utils/extractDates"; // 🚧 Commented out for now
// import extractDatesVerify from "./extractDatesVerify"; // 🚧 Commented out for now wip
import extractAmounts from "../Utils/extractAmounts"; // 🚧 Commented out for now
import extractDescription from "../Utils/extractDescription"; // 🚧 Commented out for now
// import extractDescriptionVerify from "./extractDescriptionVerify"; // 🚧 Commented out for now wip
import VerifyTransactions from "../Utils/VerifyTransactions"; // 🚧 Commented out for now
import VerifyTransactions2 from "../Utils/VerifyTransactions2"; // 🚧 Commented out for now

export const ExtractAutomaticActions = ({
  id,
  bankName, // ✅ Ensure bankName is correctly passed
  clientData,
  setClientData, // ✅ Ensure it's passed
  setIsProcessing,
  setExtractionStatus,
  processingMethod,
}) => {
  const [processing, setProcessing] = useState(false);

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

  const startExtractionProcess = async () => {
    if (!id || !bankName) {
      alert("Client ID or Bank Name is missing.");
      return;
    }
  
    setProcessing(true);
    setIsProcessing(true);
    setExtractionStatus({});
  
    try {
      // Step 1: Check if rawData exists
      setExtractionStatus((prev) => ({ ...prev, "Checking raw data": "processing" }));
  
      const rawDataExists = clientData?.rawData && clientData.rawData.length > 0;
  
      if (rawDataExists) {
        console.log("✅ Raw data found, copying to filteredData...");
  
        // ✅ Copy rawData into filteredData
        await updateDoc(doc(db, "clients", id), { filteredData: clientData.rawData });
  
        // ✅ Fetch updated client data to ensure filteredData is available
        const updatedClientSnap = await getDoc(doc(db, "clients", id));
        const updatedClientData = updatedClientSnap.data();
        setClientData(updatedClientData);
        setExtractionStatus((prev) => ({ ...prev, "Checking raw data": "success" }));
        console.log("✅ rawData successfully copied to filteredData.");
        } 
      else {
        console.log("❌ No raw data found, extracting...");
        setExtractionStatus((prev) => ({ ...prev, "Extracting raw data": "processing" }));
  
        const extractionSuccess = await extractRawData();
  
        if (!extractionSuccess) {
          console.error("🔥 Extraction failed, raw data was not created.");
          setExtractionStatus((prev) => ({ ...prev, "Extracting raw data": "failed" }));
          alert("Error: Extraction failed. Raw data was not created.");
          return; // Stop the process if extraction failed
        }
  
        setExtractionStatus((prev) => ({ ...prev, "Extracting raw data": "success" }));
      }
  
      // Step 2: Clean Statement
      setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "processing" }));
      try {
        await cleanStatement({ id, bankName });
        setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "success" }));
      } catch (error) {
        console.error("❌ Cleaning statement failed:", error);
        setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "failed" }));
        return; // Stop process if cleaning fails
      }


      // Step 2.1: Create database structure
      setExtractionStatus((prev) => ({ ...prev, "Creating database structure": "processing" }));
      try {
        await createDatabaseStructure(id);
        setExtractionStatus((prev) => ({ ...prev, "Creating database structure": "success" }));
      } catch (error) {
        console.error("⚠️ Creating database structure failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Creating database structure": "failed" }));
      }
  
      // Step 3: Extract Dates
      setExtractionStatus((prev) => ({ ...prev, "Extracting dates": "processing" }));
      try {
        await extractDates(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Extracting dates": "success" }));
      } catch (error) {
        console.error("⚠️ Extracting dates failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Extracting dates": "failed" }));
      }

      // Step 3.1: Verify and Clean up Dates uniformity the dates
      // setExtractionStatus((prev) => ({ ...prev, "Verifing dates": "processing" }));
      // try {
      //   await extractDatesVerify(id, bankName);
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing dates": "success" }));
      // } catch (error) {
      //   console.error("⚠️ Verifing dates failed, continuing...");
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing dates": "failed" }));
      // }
  
      // Step 4: Extract Amounts
      setExtractionStatus((prev) => ({ ...prev, "Extracting amounts": "processing" }));
      try {
        await extractAmounts(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Extracting amounts": "success" }));
      } catch (error) {
        console.error("⚠️ Extracting amounts failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Extracting amounts": "failed" }));
      }


      // Step 5: Extract Descriptions
      setExtractionStatus((prev) => ({ ...prev, "Extracting descriptions": "processing" }));
      try {
        await extractDescription(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Extracting descriptions": "success" }));
      } catch (error) {
        console.error("⚠️ Extracting descriptions failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Extracting descriptions": "failed" }));
      }

      // Step 5.1: Verify and Clean up Descriptions
      // setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "processing" }));
      // try {
      //   await extractDescriptionVerify(id, bankName);
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "success" }));
      // } catch (error) {
      //   console.error("⚠️ Verifing descriptions failed, continuing...");
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "failed" }));
      // }

      // Step 6: Verify amounts
      setExtractionStatus((prev) => ({ ...prev, "Verifing amounts": "processing" }));
      try {
        await VerifyTransactions(id);
        setExtractionStatus((prev) => ({ ...prev, "Verifing amounts": "success" }));
      } catch (error) {
        console.error("⚠️ Verifing amounts failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Verifing amounts": "failed" }));
      }
 
      // Step 7: Verify amounts again
      setExtractionStatus((prev) => ({ ...prev, "Verifing amounts2": "processing" }));
      try {
        await VerifyTransactions2(id);
        setExtractionStatus((prev) => ({ ...prev, "Verifing amounts2": "success" }));
      } catch (error) {
        console.error("⚠️ Verifing amounts failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Verifing amounts2": "failed" }));
      }
   

      // ✅ Final Success Message
      alert("✅ Data extraction completed!");
      } catch (error) {
        console.error("🔥 Error in extraction pipeline:", error);
        setExtractionStatus((prev) => {
          const failedStep = Object.keys(prev).find((step) => prev[step] === "processing");
          return { ...prev, [failedStep]: "failed" };
        });
      } finally {
        setProcessing(false);
        setIsProcessing(false);
      }
  };
  
  // Calls the Cloud Function to extract raw data
  const extractRawData = async () => {
    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: id,
            bankName: bankName,
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔥 Cloud Function Response Error:", errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error("🔥 Error calling Cloud Function:", error);
      return false;
    }
  };
  // reset deletes the following in the db  transactions filteredData extractProgress
  const handlereset = () => {
    const clientRef = doc(db, "clients", id);
    updateDoc(clientRef, {
      transactions: [],
      filteredData: [],
      extractProgress: {},
    });
    // refresh the page wait 2 before reloading
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  };
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={startExtractionProcess}
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

export default ExtractAutomaticActions;
