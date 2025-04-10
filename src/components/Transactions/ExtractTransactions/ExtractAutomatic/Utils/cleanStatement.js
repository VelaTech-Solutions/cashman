// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from './ProgressUtils';

// Helper to align transactions
const handleAlignTransactions = async (data) => {
  const amountRegex = /\d+\.\d{2}/;
  let formattedTransactions = [];
  let currentTransaction = [];

  data.forEach((line) => {
    if (amountRegex.test(line)) {
      if (currentTransaction.length > 0) {
        formattedTransactions.push(currentTransaction.join(" "));
      }
      currentTransaction = [line];
    } else {
      currentTransaction.push(line);
    }
  });

  if (currentTransaction.length > 0) {
    formattedTransactions.push(currentTransaction.join(" "));
  }

  return formattedTransactions;
};

const cleanStatement = async ({ id, bankName }) => {
  if (!id || !bankName) {
    console.error("❌ Missing ID or Bank Name");
    return;
  }

  const clientRef = doc(db, "clients", id);
  const bankRef = doc(db, "banks", bankName);
  const alignmentRef = doc(db, "settings", "alignment");

  try {
    await ProgressUtils.updateProgress(id, "Clean Statement", "processing");

    const [bankSnap, filteredSnap, alignmentSnap] = await Promise.all([ 
      getDoc(bankRef), 
      getDoc(clientRef), 
      getDoc(alignmentRef) 
    ]);

    if (!filteredSnap.exists()) {
      console.error("❌ No filtered data found");
      await updateDoc(clientRef, {
        "extractProgress.Clean Statement": "failed",
      });
      return;
    }

    const bankData = bankSnap.exists() ? bankSnap.data() : {};
    const ignoredLines = bankData.ignoredLines || [];
    const fuzzyIgnoredLines = bankData.fuzzyIgnoredLines || [];
    let filteredData = filteredSnap.data().filteredData || [];

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping cleaning.");
      return;
    }

    // Initialize an array to hold the lines to be archived
    let linesToArchive = [];

    // Name the archive source field to filtered Extract
    const archiveSourceField = "filtered Extract";

    // Apply filtering: Remove lines that are in ignoredLines or match fuzzyIgnoredLines, but save them to archive first
    filteredData = filteredData.filter((line) => {
      // If the line matches ignored or fuzzy ignored, archive it first
      if (
        ignoredLines.includes(line.trim()) || 
        fuzzyIgnoredLines.some((ignored) => line.toLowerCase().includes(ignored.toLowerCase()))
      ) {
        // Add the line to the archive array
        linesToArchive.push({
          content: line,
          source: archiveSourceField,  // Or any source you want
        });
        return false;  // This will remove the line from filteredData
      }
      return true;
    });

    // If there are lines to archive, update the archive in Firestore
    if (linesToArchive.length > 0) {
      const clientData = filteredSnap.data();
      const existingArchive = clientData.archive || [];
      const updatedArchive = [...existingArchive, ...linesToArchive];
      
      await updateDoc(clientRef, {
        archive: updatedArchive,  // Add the lines to the archive
      });
    }

    // ✅ Check alignment toggle in Firestore
    const alignmentSettings = alignmentSnap.exists() ? alignmentSnap.data() : {};
    const shouldAlign = alignmentSettings[bankName] ?? false;

    // Log the alignment selection
    console.log(`Alignment for ${bankName}: ${shouldAlign ? "Enabled" : "Disabled"}`);

    if (shouldAlign) {
      filteredData = await handleAlignTransactions(filteredData);
    }

    // Save the cleaned data back into Firestore
    await updateDoc(clientRef, {
      filteredData: filteredData,
      "extractProgress.Clean Statement": "processing",
    });

    await ProgressUtils.updateProgress(id, "Clean Statement", "success");
  } catch (error) {
    await ProgressUtils.updateProgress(id, "Clean Statement", "failed");
    console.error("🔥 Error in cleanStatement:", error);
  }
};


export default cleanStatement;



// we need to store the