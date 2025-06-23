// extractDescription.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

import ProgressUtils from "../../../Utils/ProgressUtils";

const extractDescription = async (clientId, bankName) => {
  if (!clientId || !bankName) return console.error("❌ Missing Client ID or Bank Name");

  const clientRef = doc(db, "clients", clientId);
  
  try {
    console.log(`🔄 Extracting Descriptions for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "processing");
    
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "failed");
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();
    if (filteredData.length === 0) {
      console.warn(
        "⚠️ No filtered data found, skipping description extraction."
      );
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

    // Step ✅: Save results to Firestore
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
    });

    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "success");
    console.log("🎉 Description Extraction Completed!");

  } catch (error) {
    
    await ProgressUtils.updateProgress(clientId, "Descriptions Extracted", "failed");
    console.error("🔥 Error Extracting Description:", error);
  }
};

export default extractDescription;
