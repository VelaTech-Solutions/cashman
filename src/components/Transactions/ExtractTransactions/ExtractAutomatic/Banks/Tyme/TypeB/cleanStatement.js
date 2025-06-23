// Firebase Imports
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

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
const cleanStatement = async ({ clientId, bankName }) => {
  if (!clientId || !bankName) return console.error("❌ Missing Client ID or Bank Name");

  const clientRef = doc(db, "clients", clientId);
  const bankRef = doc(db, "banks", bankName);
  const alignmentRef = doc(db, "settings", "alignment");
  const bankDateRef = doc(db, "settings", "dates", bankName, "config");

  try {
    console.log(`🔄 Starting Clean Statement for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Clean Statement", "processing");

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
    const ignoredLines = bankData.ignoredLines || [];
    const fuzzyIgnoredLines = bankData.fuzzyIgnoredLines || [];

    const allDateConfigs = bankDateSnap.data();
    const firstKey = Object.keys(allDateConfigs || {})[0];
    const dateConfig = allDateConfigs?.[firstKey];

    if (!dateConfig || !dateConfig.pattern) {
      console.log("❌ Missing valid date pattern for bank:", bankName, dateConfig);
      return;
    }

    const datePattern = new RegExp(dateConfig.pattern);
    let filteredData = filteredSnap.data().filteredData || [];

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping cleaning.");
      return;
    }

    const shouldRemove = await shouldRunCleanStatement(bankName);
    const archiveSourceField = "filtered Extract";
    const initialLinesToArchive = [];

    filteredData = filteredData.filter((line) => {
      const hasMatch = hasDate(line, datePattern);
      if (
        !hasMatch ||
        (shouldRemove &&
          (ignoredLines.includes(line.trim()) ||
            fuzzyIgnoredLines.some((ignored) =>
              line.toLowerCase().includes(ignored.toLowerCase())
            )))
      ) {
        initialLinesToArchive.push({ content: line, source: archiveSourceField });
        return false;
      }
      return true;
    });

    console.log("📦 Lines to archive:", initialLinesToArchive.length);

    if (initialLinesToArchive.length > 0) {
      const existingArchive = filteredSnap.data().archive || [];
      const updatedArchive = [...existingArchive, ...initialLinesToArchive];

      await updateDoc(clientRef, {
        archive: updatedArchive,
      });
      console.log("✔️ Cleaned lines archived for", bankName);
    }

    // ✅ Alignment logic
    const alignmentSettings = alignmentSnap.exists() ? alignmentSnap.data() : {};
    const shouldAlign = alignmentSettings[bankName] ?? false;
    console.log(`Alignment for ${bankName}: ${shouldAlign ? "Enabled" : "Disabled"}`);

    if (shouldAlign) {
      filteredData = await handleAlignTransactions(filteredData);
      console.log("✔️ Transactions aligned");
    }


    // ✅ Remove ignored lines
    if (shouldRemove) {
      filteredData = filteredData.filter((line) => {
        const hasMatch = hasDate(line, datePattern);
        if (
          !hasMatch ||
          (ignoredLines.includes(line.trim()) ||
            fuzzyIgnoredLines.some((ignored) =>
              line.toLowerCase().includes(ignored.toLowerCase())
            ))
        ) {

          // still need to move the line to archive
          initialLinesToArchive.push({ content: line, source: archiveSourceField });

          return false;
        }
        return true;
      });
      console.log("✔️ Ignored lines removed");
    }

    // ✅ Update filtered data in Firestore
    await updateDoc(clientRef, {
      filteredData: filteredData,
    });

    await ProgressUtils.updateProgress(clientId, "Clean Statement", "success");
    console.log("🎉 Clean Extraction Completed!");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Clean Statement", "failed");
    console.error("🔥 Error in cleanStatement:", error);
  }
};

export default cleanStatement;
