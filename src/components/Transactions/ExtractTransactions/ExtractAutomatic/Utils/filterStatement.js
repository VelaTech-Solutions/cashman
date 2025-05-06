// Firebase Imports
import { doc, setDoc,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "./ProgressUtils";

const filterStatement = async ({ clientId, bankName }) => {
    if (!clientId || !bankName) {
      console.error("Missing clientId or bankName");
      return;
    }
  
    try {
      console.log("🔄 Starting Filtering Statement...");
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
  
      await updateDoc(clientRef, {
        filteredData: keptLines,
        archive: [...(clientData.archive || []), ...archive],
        "extractProgress.Filter Statement": "success",
      });
  
      console.log("✔️ Filtered and archived lines updated.");
      await ProgressUtils.updateProgress(clientId, "Filter Statement", "success");
    } catch (error) {
      console.error("🔥 Error in filterStatement:", error);
      await ProgressUtils.updateProgress(clientId, "Filter Statement", "failed");
    }
  };
  

export default filterStatement;
