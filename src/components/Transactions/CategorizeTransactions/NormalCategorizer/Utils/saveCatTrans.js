import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Function to save a categorized transaction
const saveCategorizedTransaction = async (transactionData, bankName) => {
  if (!transactionData || !bankName) {
    throw new Error("Missing transaction data or bank name");
  }
  console.log('Saving categorized transactions...');
  const transactionId = new Date().getTime().toString(); // Generate a unique ID based on timestamp

  // Reference to the transaction document
  const transactionDocRef = doc(
    db,
    "transaction_database",
    bankName,
    "transactions",
    transactionId
  );
  console.log('Transactions saved successfully!');
  // Save the transaction data
  await setDoc(transactionDocRef, transactionData);
};

export default saveCategorizedTransaction;
