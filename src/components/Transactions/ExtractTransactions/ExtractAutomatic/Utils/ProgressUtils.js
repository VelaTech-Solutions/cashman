// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/ProgressUtils.js

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

const updateProgress = async (id, step, status) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      [`extractProgress.${step}`]: status,
    });
    console.log(`✅ Progress updated: ${step} = ${status}`);
  } catch (error) {
    console.error(`🔥 Failed to update progress for ${step}:`, error);
  }
};

const resetProgress = async (id) => {
  if (!id) {
    console.error("❌ Missing Client ID");
    return;
  }

  try {
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      extractProgress: {},
    });
    console.log("🔄 Progress reset successfully.");
  } catch (error) {
    console.error("🔥 Failed to reset progress:", error);
  }
};

const ProgressUtils = {
  updateProgress,
  resetProgress,
};

export default ProgressUtils;