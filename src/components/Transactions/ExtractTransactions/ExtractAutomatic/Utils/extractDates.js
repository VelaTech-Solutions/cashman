import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import BankDatesRules from "../../../../Rules/BankDatesRules"; // ✅ Ensure correct import

const extractDates = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(`🔄 Extracting Dates for Client: ${id} | Bank: ${bankName}`);

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.extractDatesProgress": "processing",
    });

    // Step 2: Fetch `filteredData` & `transactions`
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, { "extractProgress.extractDatesProgress": "failed" });
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping date extraction.");
      await updateDoc(clientRef, { "extractProgress.extractDatesProgress": "failed" });
      return;
    }

    // Step 3: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];

    // Initialize a counter for lines processed (not individual dates)
    let totalDateLinesProcessed = 0;

    filteredData.forEach((line, index) => {
        if (!line) return;

        const extractDatesFromText = (text) =>
            BankDatesRules[bankName] ? BankDatesRules[bankName](text) : [];

        const extractedDates = extractDatesFromText(line);

        // ✅ Count this line if any date was found
        if (extractedDates.length > 0) {
            totalDateLinesProcessed++;
        }

        let date1 = extractedDates[0] || null;
        let date2 = extractedDates[1] || "None";

        let strippedLine = extractedDates.reduce((acc, date) => acc.replace(date, "").trim(), line);

        updatedFilteredData[index] = strippedLine || line;

        if (!updatedTransactions[index]) {
            updatedTransactions[index] = { original: line };
        }

        updatedTransactions[index] = {
            ...updatedTransactions[index], // Keep existing data
            date1,
            date2,
            original: line,
        };
    });

    // Log total lines processed for dates
    console.log(`✅ Total Lines with Dates Processed: ${totalDateLinesProcessed}`);
    console.log("✅ Extracted Dates & Updated Transactions:");


    // Step 4: Update Firestore
    await updateDoc(clientRef, {
      filteredData: updatedFilteredData,
      transactions: updatedTransactions,
      "extractProgress.extractDatesProgress": "success",
    });

    console.log("🎉 Date Extraction Completed!");

  } catch (error) {
    console.error("🔥 Error extracting dates:", error);
    await updateDoc(clientRef, { "extractProgress.extractDatesProgress": "failed" });
  }
};

export default extractDates;
