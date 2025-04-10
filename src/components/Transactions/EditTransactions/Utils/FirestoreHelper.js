// FirestoreHelper.js

import { doc, getDoc, updateDoc, deleteDoc, setDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Load full client document
export const loadClientData = async (id) => {
  try {
    const clientRef = doc(db, "clients", id);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      return clientSnap.data();
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("Error loading client data:", error);
    throw error;
  }
};

// Save a new transaction or update an existing one (if you pass the full transaction object)
export const saveTransaction = async (clientId, transactionId, transactionData) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    // If the transaction already exists (has an ID), update it
    if (transactionId) {
      const clientSnap = await getDoc(clientRef);
      const clientData = clientSnap.data();
      const transactions = clientData.transactions || [];
      const index = transactions.findIndex(tx => tx.id === transactionId);
      if (index !== -1) {
        transactions[index] = transactionData;
        await updateDoc(clientRef, { transactions });
      } else {
        console.error("Transaction not found!");
      }
    } else {
      // If the transaction is new, add it to the transactions array
      await updateDoc(clientRef, {
        transactions: arrayUnion(transactionData), // Adds a new transaction without overwriting
      });
    }
    console.log("✅ Transaction saved/updated successfully");
  } catch (error) {
    console.error("❌ Error saving transaction:", error);
    throw error;
  }
};

// Update specific field in a transaction
export const updateTransactionField = async (clientId, transactionId, field, newValue) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const data = clientSnap.data();
      const transactions = data.transactions || [];
      const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
      
      if (transactionIndex !== -1) {
        transactions[transactionIndex][field] = newValue;
        await updateDoc(clientRef, { transactions });
        console.log(`✅ Transaction field "${field}" updated`);
      } else {
        throw new Error("Transaction not found");
      }
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("❌ Error updating transaction:", error);
    throw error;
  }
};

// Delete a specific transaction by ID
export const deleteTransaction = async (clientId, transactionId) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const data = clientSnap.data();
      const transactions = data.transactions || [];
      const updatedTransactions = transactions.filter(tx => tx.id !== transactionId); // Remove by ID
      
      await updateDoc(clientRef, { transactions: updatedTransactions });
      console.log(`✅ Transaction ${transactionId} deleted`);
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("❌ Error deleting transaction:", error);
    throw error;
  }
};

// Insert a new transaction at a specific index
export const insertTransaction = async (clientId, index, newTransaction) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const data = clientSnap.data();
      const transactions = data.transactions || [];
      
      transactions.splice(index, 0, newTransaction); // Insert at the given index
      await updateDoc(clientRef, { transactions });
      
      console.log(`✅ Transaction inserted at index ${index}`);
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("❌ Error inserting transaction:", error);
    throw error;
  }
};

// Reset the transactions array (if you want to clear it entirely)
export const resetTransactions = async (clientId) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, { transactions: [] });
    console.log("✅ All transactions have been reset");
  } catch (error) {
    console.error("❌ Error resetting transactions:", error);
    throw error;
  }
};

// Delete a field from a specific transaction
export const deleteFieldFromTransaction = async (clientId, transactionId, field) => {
  try {
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      const data = clientSnap.data();
      const transactions = data.transactions || [];
      const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
      
      if (transactionIndex !== -1) {
        delete transactions[transactionIndex][field]; // Remove field from transaction
        await updateDoc(clientRef, { transactions });
        console.log(`✅ Field "${field}" deleted from transaction ${transactionId}`);
      } else {
        throw new Error("Transaction not found");
      }
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("❌ Error deleting field from transaction:", error);
    throw error;
  }
};

