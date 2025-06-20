// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../../../firebase/firebase";

// Component Imports
import ProgressUtils from "../../../Utils/ProgressUtils";

const filterStatement = async ({ clientId, bankName, type }) => {
  if (!clientId || !bankName) {
    console.error("❌ Missing clientId or bankName");
    return;
  }

  try {
    console.log("🔄 Starting Filtering Statement...");
    await ProgressUtils.updateProgress(clientId, "Filter Statement", "processing");

    // Step 1: Load client data
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      return;
    }

    const clientData = clientSnap.data();
    let { filteredData = [], archive = [] } = clientData;

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping filtering.");
      return;
    }
    
    let filteredOut = [];

    // Step 2: Use original case for type
    console.log("typebefore", type);
    const typeKey = type.charAt(0).toLowerCase() + type.slice(1); // Keep casing as in Firestore (e.g. "typeA")
    console.log("🧽 Using type key:", typeKey);


    // === CASE 1: Header Filter ===
    const headerRef = doc(db, "settings", "headerFilter", bankName, "config");
    const headerSnap = await getDoc(headerRef);

    if (headerSnap.exists()) {
      const typeConfigs = headerSnap.data();
      const config = typeConfigs[typeKey];

      if (config?.headerFilterEnabled && config?.headerEnd) {
        const { headerEnd } = config;
        console.log(`🔍 Header filtering enabled, searching for headerEnd: "${headerEnd}"`);

        const index = filteredData.findIndex(line => line.includes(headerEnd));

        if (index !== -1) {
          filteredOut = filteredData.slice(0, index + 1).map(line => ({
            reason: `headerEnd: "${headerEnd}"`,
            line,
          }));
          filteredData = filteredData.slice(index + 1);
          console.log(`📦 Archived ${filteredOut.length} header lines`);
        } else {
          console.warn(`⚠️ headerEnd "${headerEnd}" not found`);
        }
      }
    }

    // === CASE : Footer Filter ===
    // this has to start checking at the end of the array upwards
    const footerRef = doc(db, "settings", "footerFilter", bankName, "config");
    const footerSnap = await getDoc(footerRef);

    if (footerSnap.exists()) {
      const typeConfigs = footerSnap.data();
      const config = typeConfigs[typeKey];

      if (config?.footerFilterEnabled && config?.footerEnd) {
        const { footerEnd } = config;
        console.log(`🔍 Footer filtering enabled, searching for footerEnd: "${footerEnd}"`);

        // Search from bottom up using findLastIndex
        const index = [...filteredData].reverse().findIndex(line => line.includes(footerEnd));

        if (index !== -1) {
          // Convert index from reversed array to original
          const actualIndex = filteredData.length - 1 - index;

          const footerLines = filteredData.slice(actualIndex);
          filteredOut.push(
            ...footerLines.map(line => ({
              reason: `footerEnd: "${footerEnd}"`,
              line,
            }))
          );

          filteredData = filteredData.slice(0, actualIndex);
          console.log(`📦 Archived ${footerLines.length} footer lines`);
        } else {
          console.warn(`⚠️ footerEnd "${footerEnd}" not found`);
        }
      }
    }

    // === CASE 2: HeaderFooter Filter ===
    const headerFooterRef = doc(db, "settings", "headerFooterFilter", bankName, "config");
    const headerFooterSnap = await getDoc(headerFooterRef);

    if (headerFooterSnap.exists()) {
      const typeConfigs = headerFooterSnap.data();
      const config = typeConfigs?.[typeKey];
      console.log("🔍 headerFooter config for typeKey:", config);

      if (
        config?.headerFooterFilterEnabled &&
        typeof config.headerStart === "string" &&
        config.headerStart.trim() &&
        typeof config.headerEnd === "string" &&
        config.headerEnd.trim()
      ) {
        const headerStart = config.headerStart.trim().toLowerCase();
        const headerEnd = config.headerEnd.trim().toLowerCase();

        const newFilteredData = [];
        let isBlocking = false;
        let blockBuffer = [];
        let blockCount = 0;

        for (let i = 0; i < filteredData.length; i++) {
          const line = filteredData[i];
          const lineLower = line.toLowerCase();

          if (!isBlocking && lineLower.includes(headerStart)) {
            isBlocking = true;
            blockBuffer.push(line);
            continue;
          }

          if (isBlocking) {
            blockBuffer.push(line);

            if (lineLower.includes(headerEnd)) {
              filteredOut.push(
                ...blockBuffer.map(l => ({
                  reason: `headerFooter: "${config.headerStart}" → "${config.headerEnd}"`,
                  line: l,
                }))
              );
              isBlocking = false;
              blockBuffer = [];
              blockCount++;
              continue;
            }
            continue;
          }

          // Not blocking, keep line
          newFilteredData.push(line);
        }

        // If block was never closed
        if (blockBuffer.length > 0) {
          filteredOut.push(
            ...blockBuffer.map(l => ({
              reason: `headerFooter: "${config.headerStart}" → "${config.headerEnd}" (unclosed)`,
              line: l,
            }))
          );
          blockCount++;
        }

        filteredData = newFilteredData;

        console.log(`📦 Archived ${blockCount} headerFooter blocks`);
      } else {
        console.warn("⚠️ headerFooter config not enabled or missing valid start/end");
      }
    } else {
      console.warn("❌ headerFooterSnap does not exist");
    }

    // === CASE 3: Line Filtering ===
    // Assuming you have a config for this bank and type
    const configDoc = doc(db, "settings", "filter", bankName, "config");
    const configSnap = await getDoc(configDoc);
    const config = configSnap.exists() ? configSnap.data() : {};

    // Define your filtering settings from config or defaults
    const ignoredEnabled = config?.ignoredEnabled ?? false;
    const ignoredLines = config?.ignoredLines ?? [];
    const fuzzyEnabled = config?.fuzzyEnabled ?? false;
    const fuzzyIgnoredLines = config?.fuzzyIgnoredLines ?? [];

    const keptLines = [];

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

    filteredData = keptLines;
    
    // === Save result to Firestore ===
    await updateDoc(clientRef, {
      filteredData,
      archive: [...archive, ...filteredOut],
    });

    console.log("✔️ Filtered and archived lines updated.");
    await ProgressUtils.updateProgress(clientId, "Filter Statement", "success");

  } catch (error) {
    console.error("🔥 Error in filterStatement:", error);
    await ProgressUtils.updateProgress(clientId, "Filter Statement", "failed");
  }
};

export default filterStatement;
