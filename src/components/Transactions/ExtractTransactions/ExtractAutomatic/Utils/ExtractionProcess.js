// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/ExtractionProcess.js

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import { 
    createDatabaseStructure, 
    cleanStatement, 

    extractDates, 
    extractDatesVerify,
  
    extractAmounts,
    extractAmountsVerify,
    extractAmountsVerify2, 
  
    extractDescription, 
    extractDescriptionVerify,
     } from '../Utils/';


  // Calls the Cloud Function to extract raw data
  const extractRawData = async (id, bankName, processingMethod) => {
    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: id,
            bankName,
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
  

  const ExtractionProcess = async ({
    id,
    bankName,
    clientData,
    setClientData,
    setProcessing,
    setIsProcessing,
    setExtractionStatus,
  }) => {
  
    if (!id || !bankName) {
      alert("Client ID or Bank Name is missing.");
      return;
    }
  
    setProcessing(true);
    setIsProcessing(true);
    setExtractionStatus({});
  
    try {

      // // Step 1: Create database structure
      setExtractionStatus((prev) => ({ ...prev, "Creating database structure": "processing" }));
      await createDatabaseStructure(id); // this handles progress + errors internally
      setExtractionStatus((prev) => ({ ...prev, "Creating database structure": "success" }));
      
      // // Step 2: Check if rawData exists
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
  
        const extractionSuccess = await extractRawData(id, bankName, "pdfparser");

  
        if (!extractionSuccess) {
          console.error("🔥 Extraction failed, raw data was not created.");
          setExtractionStatus((prev) => ({ ...prev, "Extracting raw data": "failed" }));
          alert("Error: Extraction failed. Raw data was not created.");
          return; // Stop the process if extraction failed
        }
  
        setExtractionStatus((prev) => ({ ...prev, "Extracting raw data": "success" }));
      }


      // Step 3: Clean Statement
      setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "processing" }));
      try {
        await cleanStatement({ id, bankName });
        setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "success" }));
      } catch (error) {
        console.error("❌ Cleaning statement failed:", error);
        setExtractionStatus((prev) => ({ ...prev, "Cleaning statement": "failed" }));
        return; // Stop process if cleaning fails
      }

      // Step 3: Extract Dates
      setExtractionStatus((prev) => ({ ...prev, "Dates Extracted": "processing" }));
      try {
        await extractDates(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Dates Extracted": "success" }));
      } catch (error) {
        console.error("❌ Dates Extracted failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Dates Extracted": "failed" }));
      }

      // // Step 3.1: Verify and Clean up Dates uniformity the dates
      // setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Dates": "processing" }));
      // try {
      //   await extractDatesVerify(id, bankName);
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Dates": "success" }));
      // } catch (error) {
      //   console.error("❌ Verifing dates failed, continuing...");
      //   setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Dates": "failed" }));
      // }
  
      // Step 4: Extract Amounts
      setExtractionStatus((prev) => ({ ...prev, "Amounts Extracted": "processing" }));
      try {
        await extractAmounts(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Amounts Extracted": "success" }));
      } catch (error) {
        console.error("⚠️ Amounts Extracted failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Amounts Extracted": "failed" }));
      }

      // Step 4.1: Verify amounts Step 1
      setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 1": "processing" }));
      try {
        await extractAmountsVerify(id);
        setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 1": "success" }));
      } catch (error) {
        console.error("⚠️ Verifing amounts failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 1": "failed" }));
      }
 
      // Step 4.2: Verify amounts Step 2
      setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 2": "processing" }));
      try {
        await extractAmountsVerify2(id);
        setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 2": "success" }));
      } catch (error) {
        console.error("⚠️ Verifing amounts failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Verifing Extracted Amounts Step 2": "failed" }));
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
      setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "processing" }));
      try {
        await extractDescriptionVerify(id, bankName);
        setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "success" }));
      } catch (error) {
        console.error("⚠️ Verifing descriptions failed, continuing...");
        setExtractionStatus((prev) => ({ ...prev, "Verifing descriptions": "failed" }));
      }


      //  Step 6: End
      // setExtractionStatus((prev) => ({ ...prev, "Extracting completed": "success" }));
      // try {
      //   await extractCompleted(id);
      //   setExtractionStatus((prev) => ({ ...prev, "Extracting completed": "success" }));
      // } catch (error) {
      //   console.error("⚠️ Extracting completed failed, continuing...");
      //   setExtractionStatus((prev) => ({ ...prev, "Extracting completed": "failed" }));
      // }




      // ✅ Final Success Message
      alert("✅ Data extraction completed!");
      } catch (error) {
        console.error("🔥 Error in extraction pipeline:", error);
        setExtractionStatus((prev) => {
          const failedStep = Object.keys(prev).find((step) => prev[step] === "processing");
          return { ...prev, [failedStep]: "failed" };
        });
      } finally {
             // reload the page
        //window.location.reload();
        setProcessing(false);
        setIsProcessing(false);
      }
  };
  


export default ExtractionProcess;