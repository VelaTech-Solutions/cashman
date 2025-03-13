// src/components/Extract/ExtractAutomaticActions.js
import { doc, updateDoc, deleteField, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Function to extract data automatically
export const handleExtractData = async (clientId, bankName, method, setIsProcessing, setErrorMessage) => {
  if (!clientId) {
    alert("Client ID is not provided.");
    return;
  }

  setIsProcessing(true);
  setErrorMessage("");

  try {
    const response = await fetch(
      "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, bankName, method }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }

    alert("Data extracted successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Error extracting data:", error);
    setErrorMessage("An error occurred while extracting data. Please try again.");
  } finally {
    setIsProcessing(false);
  }
};

// Function to delete extracted data
export const handleDeleteExtractedData = async (clientId) => {
  if (!clientId) {
    alert("Client ID is not provided.");
    return;
  }

  const confirmDelete = window.confirm("Are you sure you want to delete all extracted data? This action cannot be undone.");
  if (!confirmDelete) return;

  try {
    const clientRef = doc(db, "clients", clientId);
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

// Function to add a removal line
export const handleAddLine = async (bankName, line, setRemovalLines, setNewLine) => {
  if (!line.trim()) {
    alert("Please enter a valid line.");
    return;
  }

  try {
    const bankRef = doc(db, "banks", bankName);
    const bankSnapshot = await getDoc(bankRef);
    let currentLines = bankSnapshot.exists() ? bankSnapshot.data().removalLines || [] : [];
    const updatedLines = [...currentLines, line];

    await setDoc(bankRef, { removalLines: updatedLines }, { merge: true });
    setRemovalLines(updatedLines);
    setNewLine("");
    alert("Line added successfully!");
  } catch (error) {
    console.error("Error adding line:", error);
    alert("Failed to add line. Please try again.");
  }
};

// Function to remove a line from removal list
export const handleRemoveLine = async (index, removalLines, setRemovalLines, clientBankName) => {
  if (index < 0 || index >= removalLines.length) {
    alert("Invalid line index.");
    return;
  }

  try {
    const updatedLines = [...removalLines];
    updatedLines.splice(index, 1);
    const bankRef = doc(db, "banks", clientBankName);
    await updateDoc(bankRef, { removalLines: updatedLines });

    setRemovalLines(updatedLines);
    alert("Line removed successfully!");
  } catch (error) {
    console.error("Error removing line:", error);
    alert("Failed to remove line. Please try again.");
  }
};
