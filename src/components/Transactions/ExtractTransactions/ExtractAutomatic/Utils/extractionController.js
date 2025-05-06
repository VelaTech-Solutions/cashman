// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/ExtractionProcess.js

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import { 
    createDatabaseStructure, 
    filterStatement,
    cleanStatement, 
    extractDates, 
    extractDatesVerify,
    extractAmounts,
    extractAmountsVerify,
    extractAmountsVerify2, 
    extractDescription, 
    extractDescriptionVerify,
    verifyDatabase,
    removeNotTransactions,
     } from '../Utils/';


  // Calls the Cloud Function to extract raw data
  const extractRawData = async (clientId, bankName, processingMethod) => {
    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientId,
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
    clientId, 
    bankName, 
    clientData, 
    setClientData, 
    setProcessing, 
    setIsProcessing }) => {
    if (!clientId || !bankName) return alert("Missing ID or Bank Name");
    
    setProcessing(true);
    setIsProcessing(true);
    
    try {
      await createDatabaseStructure(clientId); // Step 1: Create database structure
  
      // Step 2: Extract Raw Data
      const rawDataExists = clientData?.rawData?.length;
      if (rawDataExists) {
        await updateDoc(doc(db, "clients", clientId), { filteredData: clientData.rawData });
        const updatedClientSnap = await getDoc(doc(db, "clients", clientId));
        setClientData(updatedClientSnap.data());
      } else {
        const extractionSuccess = await extractRawData(clientId, bankName, "pdfparser");
        if (!extractionSuccess) throw new Error("Raw data extraction failed");
      }
      

      // Step 3: filter statement
      await filterStatement({ clientId, bankName});

      // Step 3: Clean Statement
      await cleanStatement({ clientId, bankName });
  
      // Step 4: Extract Dates
      await extractDates(clientId, bankName);
      await extractDatesVerify(clientId, bankName);
  
      // Step 5: Extract Amounts
      await extractAmounts(clientId, bankName);
      await extractAmountsVerify(clientId);
      await extractAmountsVerify2(clientId);

      // Step 6: Extract Description
      await extractDescription(clientId, bankName);
      await extractDescriptionVerify(clientId, bankName);

      // Step 7: Verify Database
      await verifyDatabase(clientId);
  
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