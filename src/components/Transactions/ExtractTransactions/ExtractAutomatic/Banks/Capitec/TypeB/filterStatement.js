// Firebase Imports
import { doc, setDoc,getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const filterStatement = async ({ clientId, bankName }) => {
    if (!clientId || !bankName) {
      console.error("Missing clientId or bankName");
      return;
    }
  
    try {
      console.log("🔄 Starting Type B Filtering Statement...");
      await ProgressUtils.updateProgress(clientId, "Filter Statement", "processing");
    
      const configDoc = (bank) => doc(db, "settings", "filter", bank, "config");
      const clientRef = doc(db, "clients", clientId);
      const filterSettingRef = configDoc(bankName);
  
      // Ensure filter settings exist
      let filterSnap = await getDoc(filterSettingRef);
      if (!filterSnap.exists()) {
        console.log("⚙️ Creating default filter settings for bank:", bankName);
        await setDoc(filterSettingRef, {
          headerEnd: [],
          startBlock: [],
          endBlock: [],
          ignoredLines: [],
          fuzzyIgnoredLines: [],
          headerFilterEnabled: false,
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
        headerEnd = [],
        startBlock = [],
        endBlock = [],
        ignoredLines = [],
        fuzzyIgnoredLines = [],
        headerFilterEnabled = false,
        blockEnabled = false,
        ignoredEnabled = false,
        fuzzyEnabled = false,
      } = filterSnap.data();
  
      const archive = [];
      let filteredData = [...originalData];

      // === Header Filtering ===
      // Log if header filtering is enabled or disabled
      // if (headerFilterEnabled) {
      //   console.log("🔲 Header filtering is enabled");
      // } else {
      //   console.log("⚪ Header filtering is disabled");
      // }
      // Apply header filtering this only needs to run once , as soon as the headerEnd is found in the data archive the data from top till the end include the header end
// === Header Filtering ===
if (headerFilterEnabled) {
  console.log("🔲 Header filtering is enabled");
  if (!headerEnd.length) {
    console.log("⚠️ headerEnd array is empty, skipping header filtering");
  } else {
    console.log("📋 headerEnd values:", headerEnd);
    // console.log("📄 First 5 lines of filteredData:", filteredData.slice(0, 100));
    let headerEndIndex = -1;
    
    for (let i = 0; i < filteredData.length; i++) {
      const line = filteredData[i].trim();
      if (headerEnd.some((end) => line.toLowerCase().includes(end.toLowerCase()))) {
        headerEndIndex = i;
        console.log("✅ Header end found at line:", line);
        break;
      }
    }

    if (headerEndIndex !== -1) {
      const headerLines = filteredData.slice(0, headerEndIndex + 1);
      archive.push(
        ...headerLines.map((l) => ({ content: l, source: "header" }))
      );
      filteredData = filteredData.slice(headerEndIndex + 1);
      console.log(`📤 Archived ${headerLines.length} header lines of data`);
    } else {
      console.log("⚠️ No header end found in data");
    }
  }
} else {
  console.log("⚪ Header filtering is disabled");
}

    // === Block Filtering ===
    // Log if block filtering is enabled or disabled
    if (blockEnabled) {
      console.log("🔲 Block filtering is enabled");
    } else {
      console.log("⚪ Block filtering is disabled");
    }
    // Apply block filtering
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
