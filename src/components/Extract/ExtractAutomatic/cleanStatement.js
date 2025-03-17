import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

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

    // console.log("📌 Ignored Lines:", ignoredLines);
    // console.log("📌 Fuzzy Ignored Lines:", fuzzyIgnoredLines);

    // Step 3: Fetch filteredData
    const filteredDataRef = doc(db, "clients", id);
    const filteredDataSnap = await getDoc(filteredDataRef);
    const filteredData = filteredDataSnap.exists() ? filteredDataSnap.data().filteredData || [] : [];

    console.log("📌 Original Filtered Data Length:", filteredData.length);

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping cleaning.");
      return;
    }

    // Step 4: Apply filtering
    const cleanedData = filteredData.filter((line) => {
      // Exact match removal
      if (ignoredLines.includes(line.trim())) return false;

      // Fuzzy match removal
      return !fuzzyIgnoredLines.some((ignored) =>
        line.toLowerCase().includes(ignored.toLowerCase())
      );
    });

    console.log("✅ Cleaned Data Length:", cleanedData.length);

    // Step 5: Update Firestore with cleaned data
    await updateDoc(clientRef, { filteredData: cleanedData });

    // Step 6: Set cleaning progress to "success"
    await updateDoc(clientRef, { "extractProgress.cleanStatementProgress": "success" });

    console.log("🎉 Cleaning Completed! Removed:", filteredData.length - cleanedData.length, "lines.");

  } catch (error) {
    console.error("🔥 Error in cleanStatement:", error);
    await updateDoc(doc(db, "clients", id), { "extractProgress.cleanStatementProgress": "failed" });
  }
};

export default cleanStatement;
