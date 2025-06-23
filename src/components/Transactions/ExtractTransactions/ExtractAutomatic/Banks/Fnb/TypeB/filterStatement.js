// Firebase Imports
import { doc, setDoc,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const filterStatement = async ({ clientId, bankName, type }) => {
  if (!clientId || !bankName || !type) {console.error("❌ Missing Client ID, Bank Name or Type");
    return;
  }
  
  try {
    console.log(`🔄 Starting Filtering Statement for Client: ${clientId} | Bank: ${bankName}`);
    await ProgressUtils.updateProgress(clientId, "Filter Statement", "processing");
  
    const configDoc = (bank) => doc(db, "settings", "filter", bank, "config");
    const clientRef = doc(db, "clients", clientId);
    const filterSettingRef = configDoc(bankName);

    // Ensure filter settings exist
    let filterSnap = await getDoc(filterSettingRef);
    if (!filterSnap.exists()) {
      console.log("⚙️ Creating default filter settings for bank:", bankName);
      await setDoc(filterSettingRef, {
        ignoredLines: [],
        fuzzyIgnoredLines: [],
        ignoredEnabled: false,
        fuzzyEnabled: false,
      });
      filterSnap = await getDoc(filterSettingRef);
    }

    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    const clientData = clientSnap.data();
    const filteredData = clientData.filteredData || [];

    const {
      ignoredLines = [],
      fuzzyIgnoredLines = [],
      ignoredEnabled = false,
      fuzzyEnabled = false,
    } = filterSnap.data();

    const archive = [];
    const keptLines = [];

    filteredData.forEach((line) => {
      const trimmed = line.trim();
      const isExact = ignoredEnabled && ignoredLines.includes(trimmed);
      const isFuzzy = fuzzyEnabled && fuzzyIgnoredLines.some((fuzzy) =>
        trimmed.toLowerCase().includes(fuzzy.toLowerCase())
      );

      if (isExact || isFuzzy) {
        archive.push({ content: line, source: "filter" });
      } else {
        keptLines.push(line);
      }
    });

    // Step ✅: Save results to Firestore
    await updateDoc(clientRef, {
      filteredData: keptLines,
      archive: [...(clientData.archive || []), ...archive],
    });

    await ProgressUtils.updateProgress(clientId, "Filter Statement", "success");
    console.log("🎉 Filtered and archived successfully.");

  } catch (error) {

    await ProgressUtils.updateProgress(clientId, "Filter Statement", "failed");
    console.error("🔥 Error in Filtering Statement:", error);
  }
};
  

export default filterStatement;
