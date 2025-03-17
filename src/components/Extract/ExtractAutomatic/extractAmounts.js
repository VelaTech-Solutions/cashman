import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import BankAmountsRules from "../../Rules/bankAmountsRules"; // ✅ Ensure correct import

const extractAmounts = async (id, bankName) => {
  if (!id || !bankName) {
    console.error("❌ Missing Client ID or Bank Name");
    return;
  }

  try {
    console.log(`🔄 Extracting Amounts for Client: ${id} | Bank: ${bankName}`);

    // Step 1: Set Firestore progress to "processing"
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      "extractProgress.extractAmountsProgress": "processing",
    });

    // Step 2: Fetch client data
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      console.error("❌ No client data found");
      await updateDoc(clientRef, {
        "extractProgress.extractAmountsProgress": "failed",
      });
      return;
    }

    let { filteredData = [], transactions = [] } = clientSnap.data();

    if (filteredData.length === 0) {
      console.warn("⚠️ No filtered data found, skipping amount extraction.");
      await updateDoc(clientRef, {
        "extractProgress.extractAmountsProgress": "failed",
      });
      return;
    }

    // Step 3: Process each line in filteredData
    const updatedFilteredData = [...filteredData];
    const updatedTransactions = [...transactions];

    filteredData.forEach((line, index) => {
      if (!line) return;

      // ✅ Apply bank-specific extraction rule
      const extractedAmounts =
        BankAmountsRules[bankName](line) || ["0.00", "0.00", "0.00"];

      // ✅ Ensure all amounts exist (Fallback to "0.00")
      const [fees_amount, credit_debit_amount, balance_amount] =
        extractedAmounts.map((amount) => amount || "0.00");

      // ✅ Remove extracted amounts from the original line
      const strippedLine = extractedAmounts.reduce(
        (acc, amount) => acc.replace(amount, "").trim(),
        line
      );

      // Update our local copy of filteredData with the stripped line
      updatedFilteredData[index] = strippedLine;

      // Ensure transactions[index] exists
      if (!updatedTransactions[index]) {
        updatedTransactions[index] = { original: line };
      }

      // ✅ Merge with existing transaction data
      updatedTransactions[index] = {
        ...updatedTransactions[index], // Keep any existing data
        fees_amount,
        credit_debit_amount,
        balance_amount,
        original: line,
      };
    });

    console.log("✅ Amounts Extracted:", updatedTransactions);

    // Step 4: Update Firestore with both the updated transactions AND the stripped filteredData
    await updateDoc(clientRef, {
      transactions: updatedTransactions,
      filteredData: updatedFilteredData, // Store stripped lines
      "extractProgress.extractAmountsProgress": "success",
    });

    console.log("🎉 Amount Extraction Completed!");
  } catch (error) {
    console.error("🔥 Error extracting amounts:", error);
    await updateDoc(clientRef, {
      "extractProgress.extractAmountsProgress": "failed",
    });
  }
};

export default extractAmounts;
