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
    removeNotTransactions,
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
  
  const extractionController = async ({
    id, 
    bankName, 
    clientData, 
    setClientData, 
    setProcessing, 
    setIsProcessing }) => {
    if (!id || !bankName) return alert("Missing ID or Bank Name");
    
    setProcessing(true);
    setIsProcessing(true);
    
    try {
      await createDatabaseStructure(id); // Step 1: Create database structure
  
      // Step 2: Extract Raw Data
      const rawDataExists = clientData?.rawData?.length;
      if (rawDataExists) {
        await updateDoc(doc(db, "clients", id), { filteredData: clientData.rawData });
        const updatedClientSnap = await getDoc(doc(db, "clients", id));
        setClientData(updatedClientSnap.data());
      } else {
        const extractionSuccess = await extractRawData(id, bankName, "pdfparser");
        if (!extractionSuccess) throw new Error("Raw data extraction failed");
      }
  
      // Step 3: Clean Statement
      await cleanStatement({ id, bankName });
  
      // Step 4: Extract Dates
      await extractDates(id, bankName);
      //await extractDatesVerify(id, bankName);
  
      // Step 5: Extract Amounts
      await extractAmounts(id, bankName);
      await extractAmountsVerify(id);
      await extractAmountsVerify2(id);

      // Step 6: Extract Description
      await extractDescription(id, bankName);
      await extractDescriptionVerify(id, bankName);
  
      alert("✅ Data extraction completed!");
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("❌ Extraction failed, please check the logs.");
    } finally {
      setProcessing(false);
      setIsProcessing(false);
    }
  };
  
  export default extractionController;