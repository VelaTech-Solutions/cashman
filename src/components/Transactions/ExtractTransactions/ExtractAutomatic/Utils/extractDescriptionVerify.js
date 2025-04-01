// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/extractDescriptionVerify.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

const extractDescriptionVerify = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(
      `🔄 Verifying and Cleaning Descriptions for Client: ${id} | Bank: ${bankName}`
    );

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.Descriptions Verified": "processing",
    });

    // Step 2: Fetch client data
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, {
        "extractProgress.Descriptions Verified": "failed",
      });
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn(
        "⚠️ No filtered data found, skipping veriftioaction and cleaning description extraction."
      );
      await updateDoc(clientRef, {
        "extractProgress.Descriptions Verified": "failed",
      });
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

    // Log total lines processed for descriptions
    // console.log(`✅ Total Lines with Verifying and Cleaning Descriptions Processed: ${totalDescriptionLinesProcessed}`);
    // console.log("✅ Descriptions Verifying Cleaning:");


    // Step 4: Update Firestore with the updated transactions and stripped filteredData
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData,
      "extractProgress.Descriptions Verified": "success",
    });

    console.log("🎉 Description Verifying and Cleaning Completed!");
  } catch (error) {
    console.error("🔥 Error Verifying and Cleaning description:", error);
    await updateDoc(clientRef, {
      "extractProgress.Descriptions Verified": "failed",
    });
  }
};

export default extractDescriptionVerify;
