import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

const cleanStatement = async ({ id, bankName }) => {
  if (!id || !bankName) {
    console.error("❌ Missing ID or Bank Name");
    return;
  }

  try {
    console.log("🔄 Starting cleanStatement...");

    // Step 1: Set cleaning progress to "processing"
    const clientRef = doc(db, "clients", id);
    await setDoc(clientRef, { extractProgress: { cleanStatementProgress: "processing" } }, { merge: true });

    // Step 2: Fetch ignored lines & fuzzy ignored lines
    const bankRef = doc(db, "banks", bankName);
    const bankSnapshot = await getDoc(bankRef);
    const bankData = bankSnapshot.exists() ? bankSnapshot.data() : {};

    const ignoredLines = bankData.ignoredLines || [];
    const fuzzyIgnoredLines = bankData.fuzzyIgnoredLines || [];

    // Step 3: Fetch filteredData
    const filteredDataRef = doc(db, "clients", id);
    const filteredDataSnap = await getDoc(filteredDataRef);
    let filteredData = filteredDataSnap.exists() ? filteredDataSnap.data().filteredData || [] : [];

    console.log("📌 Original Filtered Data Length:", filteredData.length);

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping cleaning.");
      return;
    }

    // Step 4: Apply filtering to remove unwanted lines
    let cleanedData = filteredData.filter((line) => {
      return (
        !ignoredLines.includes(line.trim()) && // Exact match removal
        !fuzzyIgnoredLines.some((ignored) => line.toLowerCase().includes(ignored.toLowerCase())) // Fuzzy match removal
      );
    });

    console.log("✅ Cleaned Data Length:", cleanedData.length);

    // Step 5: Align transactions based on the bank type
    const handleAlignTransactions = async (data) => {
      const amountRegex = /\d+\.\d{2}/; // Detects amounts (e.g., 105.00)
      let formattedTransactions = [];
      let currentTransaction = [];

      data.forEach((line) => {
        if (amountRegex.test(line)) {
          if (currentTransaction.length > 0) {
            formattedTransactions.push(currentTransaction.join(" ")); // Merge previous transaction
          }
          currentTransaction = [line]; // Start a new transaction
        } else {
          currentTransaction.push(line); // Append additional details
        }
      });

      if (currentTransaction.length > 0) {
        formattedTransactions.push(currentTransaction.join(" ")); // Add last transaction
      }

      return formattedTransactions;
    };

    // Define bank-specific alignment rules
    const banksWithAlignment = ["Absa Bank", "Capitec Bank", "Ned Bank", "Standard Bank"];

    if (banksWithAlignment.includes(bankName)) {
      console.log(`🔄 Aligning transactions for ${bankName}...`);
      cleanedData = await handleAlignTransactions(cleanedData);
    } else {
      console.log(`⏭️ Skipping alignment for ${bankName}`);
    }

    // Step 6: Update Firestore with cleaned & aligned data
    await updateDoc(clientRef, { filteredData: cleanedData });

    // Step 7: Set cleaning progress to "success"
    await updateDoc(clientRef, { "extractProgress.cleanStatementProgress": "success" });

    console.log("🎉 Cleaning Completed! Removed:", filteredData.length - cleanedData.length, "lines.");
  } catch (error) {
    console.error("🔥 Error in cleanStatement:", error);
    await updateDoc(doc(db, "clients", id), { "extractProgress.cleanStatementProgress": "failed" });
  }
};

export default cleanStatement;


    // "Absa Bank", handleAddLine
    // "Capitec Bank", Skip
    // "Fnb Bank", Skip
    // "Ned Bank", handleAddLine
    // "Standard Bank", handleAddLine
    // "Tyme Bank", Skip