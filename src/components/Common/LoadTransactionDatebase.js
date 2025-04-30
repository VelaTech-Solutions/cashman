// src/components/LoadTransactionDatabase.js
import { db } from "../../firebase/firebase"; // Import your Firestore instance
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
  } from "firebase/firestore";

// notes 
// firebase database
// db(root)

    // trasaction_database(Start collection)

        // bankName (document)

            // transactions(collection)
                // 4ZCFhYw1sZocbYhOZIkQ
                // (fields)
                // jSTUQEq12ZSuBW8Oc6Nf
                // (fields)

                    // category(fields)
                    // "Expenses"
                    // (string)
                    // createdAt(fields)
                    // "2025-04-08T22:33:16.918Z"
                    // (string)
                    // description(fields)
                    // "fnb app prepaid airtime"
                    // (string)
                    // subcategory(fields)
                    // "Airtime"
                    // (string)

export const loadTransactionDatebase = async (bankName) => {
  try {
    const snapshot = await getDocs(collection(db, `transaction_database/${bankName}/transactions`));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error loading Transactions Data:", error);
    return [];
  }
};



//   transactionData must contain the following
                    // category(fields)
                    // "Expenses"
                    // (string)
                    // createdAt(fields)
                    // "2025-04-08T22:33:16.918Z"
                    // (string)
                    // description(fields)
                    // "fnb app prepaid airtime"
                    // (string)
                    // subcategory(fields)
                    // "Airtime"
                    // (string)

// Fix this:
export const addTransactionDatabase = async (bankName, transactionData) => {
  try {
    await addDoc(collection(db, "transaction_database", bankName, "transactions"), transactionData);
  } catch (error) {
    console.error("Error adding Transaction Data:", error);
  }
};
