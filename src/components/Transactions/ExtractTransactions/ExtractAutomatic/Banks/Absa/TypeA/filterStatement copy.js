// Firebase Imports
import { doc, setDoc,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const filterStatement = async ({ clientId, bankName, type }) => {
    if (!clientId || !bankName) {
      console.error("Missing clientId or bankName");
      return;
    }
  
    try {
      console.log("🔄 Starting Filtering Statement...");
      await ProgressUtils.updateProgress(clientId, "Filter Statement", "processing");

      // Step 1: Get client data
      const clientRef = doc(db, "clients", clientId);
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) {
        console.error("❌ No client data found");
        return;
      }

      let { filteredData = [], transactions = [] } = clientSnap.data();

      if (filteredData.length === 0) {
        console.warn("⚠️ No filtered data found, skipping date extraction.");
        return;
      }



      // Normalize type (e.g., "TypeA" → "typeA")
      const typeKey = type.charAt(0).toLowerCase() + type.slice(1);
    
      const configDoc = (bank) => doc(db, "settings", "filter", bank, "config");
      const clientRef = doc(db, "clients", clientId);
      const filterSettingRef = configDoc(bankName);

      const getFilterConfig = (type, bank) => {
        switch (type) {
          case "headerFilter":
            return {
              ref: doc(db, "settings", "headerFilter", bank, "config"),
              default: {
                headerFilterEnabled: false,
                headerEnd: "",
              }
            };
          case "HeaderFooterFilter":
            return {
              ref: doc(db, "settings", "HeaderFooterFilter", bank, "config"),
              default: {
                headerFooterFilterEnabled: false,
                headerStart: "",
                headerEnd: "",
              }
            };
          default:
            throw new Error(`Unknown filter type: ${type}`);
        }
      };

      // Ensure filter settings exist
      let filterSnap = await getDoc(filterSettingRef);
      if (!filterSnap.exists()) {
        console.log("⚙️ Creating default filter settings for bank:", bankName);
        await setDoc(filterSettingRef, {
          startBlock: [],
          endBlock: [],
          ignoredLines: [],
          fuzzyIgnoredLines: [],
          blockEnabled: false,
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
      const originalData = clientData.filteredData || [];
  
      const {
        startBlock = [],
        endBlock = [],
        ignoredLines = [],
        fuzzyIgnoredLines = [],
        blockEnabled = false,
        ignoredEnabled = false,
        fuzzyEnabled = false,
      } = filterSnap.data();
  
      const archive = [];
      let filteredData = [...originalData];

    // === Block Filtering ===
    // Log if block filtering is enabled or disabled
    if (blockEnabled) {
      console.log("🔲 Block filtering is enabled");
    } else {
      console.log("⚪ Block filtering is disabled");
    }
    // Apply block filtering this will now use 
    // case "headerFilter":
    //   return {
    //     ref: doc(db, "settings", "headerFilter", bank, "config"),
    //     default: {
    //       headerFilterEnabled: false,
    //       headerEnd: "",
    //     }
    let blockCount = 0; // count blocks filtered
    if (blockEnabled && startBlock.length && endBlock.length) {
      const newFilteredData = [];
      let isBlocking = false;
      let currentBlockStart = null;
      let blockBuffer = [];
      for (let i = 0; i < filteredData.length; i++) {
        const line = filteredData[i];
        const trimmed = line.trim();
        if (!isBlocking && startBlock.some((start) => trimmed.includes(start))) {
          isBlocking = true;
          currentBlockStart = trimmed;
          blockBuffer.push(line);
          continue;
        }
        if (isBlocking) {
          blockBuffer.push(line);
          if (endBlock.some((end) => trimmed.includes(end))) {
            archive.push(
              ...blockBuffer.map((l) => ({ content: l, source: `block ${blockCount + 1}` }))
            );
            isBlocking = false;
            blockBuffer = [];
            currentBlockStart = null;
            blockCount++;  // increment block count here
          }
          continue;
        }
        if (!isBlocking) {
          newFilteredData.push(line);
        }
      }
      // If block was not closed
      if (blockBuffer.length > 0) {
        archive.push(
          ...blockBuffer.map((l) => ({ content: l, source: `block ${blockCount + 1} (unclosed)` }))
        );
        blockCount++;
      }
      filteredData = newFilteredData;
    }

    console.log(`📦 Total blocks filtered and archived: ${blockCount}`);


    // === Line Filtering ===
    const keptLines = [];

    // Log if line filtering is enabled or disabled
    if (ignoredEnabled) {
      console.log("🔲 Line filtering is enabled");
    } else {
      console.log("⚪ Line filtering is disabled");
    }

    if (fuzzyEnabled) {
      console.log("🔲 Fuzzy filtering is enabled");
    } else {
      console.log("⚪ Fuzzy filtering is disabled");
    }

    filteredData.forEach((line) => {
      const trimmed = line.trim();
      const isExact = ignoredEnabled && ignoredLines.includes(trimmed);
      const isFuzzy = fuzzyEnabled && fuzzyIgnoredLines.some((fuzzy) =>
        trimmed.includes(fuzzy)
      );

      if (isExact || isFuzzy) {
        archive.push({ content: line, source: "filter" });
      } else {
        keptLines.push(line);
      }
    });

    // === Update Firestore ===
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
