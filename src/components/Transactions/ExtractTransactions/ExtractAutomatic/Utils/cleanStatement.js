// Firebase Imports
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "./ProgressUtils";

// 🔁 Helper to align transactions
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

// 🔁 Helper to check or create removal settings
const shouldRunCleanStatement = async (bankName) => {
  const removalRef = doc(db, "settings", "removal");
  const snap = await getDoc(removalRef);

  if (!snap.exists()) {
    await setDoc(removalRef, { [bankName]: false });
    return false;
  }

  const settings = snap.data();
  return settings[bankName] ?? false;
};

// 🔁 Helper to find transaction by date
const hasDate = (line, pattern) => {
  if (!pattern) return false;
  return pattern.test(line);
};

// ✅ Clean statement main function
const cleanStatement = async ({ id, bankName }) => {
  if (!id || !bankName) {
    console.error("❌ Missing ID or Bank Name");
    return;
  }

  const clientRef = doc(db, "clients", id);
  const bankRef = doc(db, "banks", bankName);
  const alignmentRef = doc(db, "settings", "alignment");
  const bankDateRef = doc(db, "settings", "dates", bankName, "config");

  try {
    console.log("🔄 Starting Clean Statement...");

    await ProgressUtils.updateProgress(id, "Clean Statement", "processing");

    const [bankSnap, filteredSnap, alignmentSnap, bankDateSnap] = await Promise.all([
      getDoc(bankRef),
      getDoc(clientRef),
      getDoc(alignmentRef),
      getDoc(bankDateRef),
    ]);

    if (!filteredSnap.exists()) {
      console.error("❌ No filtered data found");
      await updateDoc(clientRef, {
        "extractProgress.Clean Statement": "failed",
      });
      return;
    }

    const bankData = bankSnap.exists() ? bankSnap.data() : {};
    const dateConfig = bankDateSnap.exists() ? bankDateSnap.data().config : {};
    const datePattern = dateConfig.pattern ? new RegExp(dateConfig.pattern) : null;

    const ignoredLines = bankData.ignoredLines || [];
    const fuzzyIgnoredLines = bankData.fuzzyIgnoredLines || [];
    let filteredData = filteredSnap.data().filteredData || [];

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping cleaning.");
      return;
    }

    // ✅ Check toggle from settings/removal
    const shouldRemove = await shouldRunCleanStatement(bankName);
    if (shouldRemove) {
      const archiveSourceField = "filtered Extract";
      let linesToArchive = [];

      filteredData = filteredData.filter((line) => {
        const hasMatch = hasDate(line, datePattern);

        if (
          ignoredLines.includes(line.trim()) ||
          fuzzyIgnoredLines.some((ignored) => line.toLowerCase().includes(ignored.toLowerCase())) ||
          !hasMatch
        ) {
          linesToArchive.push({
            content: line,
            source: archiveSourceField,
          });
          return false;
        }
        return true;
      });

      console.log(`Lines to archive:`, linesToArchive);

      if (linesToArchive.length > 0) {
        const clientData = filteredSnap.data();
        const existingArchive = clientData.archive || [];
        const updatedArchive = [...existingArchive, ...linesToArchive];

        await updateDoc(clientRef, {
          archive: updatedArchive,
        });
        console.log("✔️ Cleaned lines archived for", bankName);
      }
    } else {
      console.log(`⚠️ Clean Statement removal skipped for ${bankName}`);
    }

    // ✅ Alignment logic
    const alignmentSettings = alignmentSnap.exists() ? alignmentSnap.data() : {};
    const shouldAlign = alignmentSettings[bankName] ?? false;
    console.log(`Alignment for ${bankName}: ${shouldAlign ? "Enabled" : "Disabled"}`);

    if (shouldAlign) {
      filteredData = await handleAlignTransactions(filteredData);
      console.log("✔️ Transactions aligned");
    }

    // ✅ Update filtered data in Firestore
    await updateDoc(clientRef, {
      filteredData: filteredData,
      "extractProgress.Clean Statement": "processing",
    });

    await ProgressUtils.updateProgress(id, "Clean Statement", "success");
    console.log("✔️ Clean Statement completed successfully");
  } catch (error) {
    await ProgressUtils.updateProgress(id, "Clean Statement", "failed");
    console.error("🔥 Error in cleanStatement:", error);
  }
};

export default cleanStatement;
