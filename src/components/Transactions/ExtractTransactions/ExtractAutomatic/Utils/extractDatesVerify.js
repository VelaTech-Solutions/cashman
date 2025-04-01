import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import BankDatesRules from "../../../../Rules/BankDatesRules"; // ⬅️ Assuming you have this defined elsewhere

const extractDatesVerify = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  const clientRef = doc(db, "clients", id);

  try {
    await updateDoc(clientRef, {
      "extractProgress.Verifing Extracted Dates": "processing",
    });

    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      await updateDoc(clientRef, {
        "extractProgress.Verifing Extracted Dates": "failed",
      });
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();
    if (filteredData.length === 0) {
      await updateDoc(clientRef, {
        "extractProgress.Verifing Extracted Dates": "failed",
      });
      return;
    }

    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];
    let totalDateLinesProcessed = 0;

    filteredData.forEach((line, index) => {
      if (!line) return;

      const extractDates = BankDatesRules[bankName] || (() => []);
      const extractedDates = extractDates(line);

      if (extractedDates.length > 0) totalDateLinesProcessed++;

      const date1 = extractedDates[0] || null;
      const date2 = extractedDates[1] || "None";
      const cleanedLine = extractedDates.reduce(
        (acc, d) => acc.replace(d, "").trim(),
        line
      );

      updatedFilteredData[index] = cleanedLine || line;

      if (!updatedTransactions[index]) {
        updatedTransactions[index] = { original: line };
      }

      updatedTransactions[index] = {
        ...updatedTransactions[index],
        date1,
        date2,
      };
    });

    await updateDoc(clientRef, {
      filteredData: updatedFilteredData,
      transactions: updatedTransactions,
      "extractProgress.Verifing Extracted Dates": "success",
    });

  } catch (error) {
    console.error("🔥 Error verifying dates:", error);
    await updateDoc(clientRef, {
      "extractProgress.Verifing Extracted Dates": "failed",
    });
  }
};

export default extractDatesVerify;
