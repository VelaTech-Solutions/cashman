import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Function to save a categorized transaction
const saveCategorizedTransaction = async (transactionData, bankName) => {
  if (!transactionData || !bankName) {
    throw new Error("Missing transaction data or bank name");
  }

  try {
    console.log("Saving categorized transaction...");
    const transactionId = new Date().getTime().toString();

    const transactionDocRef = doc(
      db,
      "transaction_database",
      bankName,
      "transactions",
      transactionId
    );

    await setDoc(transactionDocRef, transactionData);
    console.log("Transaction saved successfully:", transactionData);
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};

export default saveCategorizedTransaction;