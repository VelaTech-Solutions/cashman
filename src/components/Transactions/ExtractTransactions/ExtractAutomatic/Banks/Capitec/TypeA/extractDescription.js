// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractDescription.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";
import ProgressUtils from "../../../Utils/ProgressUtils";

const extractDescription = async (clientId, bankName) => {
  if (!clientId || !bankName) return console.error("❌ Missing Client ID or Bank Name");

  try {
    console.log(`🔄 Extracting Descriptions for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "processing");

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", clientId);
    // Step 2: Fetch client data
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No Client data found");
      await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "failed");
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.error("❌ No filtered data found");
      await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "failed");
      return;
    }

    // Step 3: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];

    // Initialize a counter for lines where descriptions were extracted
    let totalDescriptionLinesProcessed = 0;

    filteredData.forEach((line, index) => {
        if (!line) return;

        // In this case, use the entire line as the description
        const description = line.trim();

        // ✅ Count the line as processed if it contains a description
        if (description) {
            totalDescriptionLinesProcessed++;
        }

        // Remove the description from the original line (results in an empty string)
        const strippedLine = "";

        // Update our local copy of filteredData with the stripped line
        updatedFilteredData[index] = strippedLine;

        // Ensure transactions[index] exists
        if (!updatedTransactions[index]) {
            updatedTransactions[index] = { original: line };
        }

        // Merge with existing transaction data
        updatedTransactions[index] = {
            ...updatedTransactions[index],
            description,
        };
    });

    // Step 4: Update Firestore with the updated transactions and stripped filteredData
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
    });


    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "success");
    console.log("🎉 Description Extraction Completed!");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "failed");
    console.error("🔥 Error verifying dates:", error);
  }
};

export default extractDescription;
