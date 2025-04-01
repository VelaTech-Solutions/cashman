// SmartCategorizer.js
import React, { useEffect, useState } from "react";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import SmartCategorizeActions from "./Actions/SmartCategorizeActions";
import SmartCategorizeTable from "./Tables/SmartCategorizeTable";

const SmartCategorizer = ({ clientId }) => {
  const [sTransactions, setSTransactions] = useState([]);
  const [status, setStatus] = useState("Checking transactions...");

  useEffect(() => {
    const fetchSTransactions = async () => {
      try {
        const clientDocRef = doc(db, "clients", clientId);
        const clientSnapshot = await getDoc(clientDocRef);
        const data = clientSnapshot.data();
        if (data && data.sTransactions && data.sTransactions.length > 0) {
          setSTransactions(data.sTransactions);
          setStatus("✅ Smart transactions found.");
        } else {
          setStatus("⚠️ No smart transactions yet. Please click the copy button.");
        }
      } catch (err) {
        console.error("Error fetching sTransactions:", err);
        setStatus("❌ Error loading smart transactions.");
      }
    };

    fetchSTransactions();
  }, [clientId]);

  const handleCopyTransactions = async () => {
    try {
      const clientRef = doc(db, "clients", clientId);
      const snapshot = await getDoc(clientRef);
      const data = snapshot.data();
      if (!data || !data.transactions) return;

      await updateDoc(clientRef, {
        sTransactions: data.transactions,
      });

      setSTransactions(data.transactions);
      setStatus("✅ Transactions copied successfully.");
    } catch (err) {
      console.error("Failed to copy transactions:", err);
      setStatus("❌ Failed to copy transactions.");
    }
  };
  
  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Smart Categorizer</h1>

        <p className="text-sm text-gray-400 mb-4">
          The Smart Categorizer uses fuzzy logic to help automatically categorize transactions.
        </p>

        <SmartCategorizeActions
          clientId={clientId}
          transactions={sTransactions}
          setTransactions={setSTransactions}
          setStatus={setStatus}
        />

        {sTransactions && sTransactions.length > 0 ? (
          <div className="flex space-x-6 mt-2">
            <span className="font-semibold">Transactions: {sTransactions.length}</span>
            <span className="font-semibold">Categorized: {sTransactions.filter(txn => txn.category).length}</span>
            <span className="font-semibold">Uncategorized: {sTransactions.filter(txn => !txn.category).length}</span>
            <span className="font-semibold">Matched: 🟢 {sTransactions.filter(txn => txn.matched === "🟢").length}</span>
            <span className="font-semibold">Unmatched: 🔴 {sTransactions.filter(txn => txn.matched === "🔴").length}</span>
            <span className="font-semibold">Partially Matched: 🟡 {sTransactions.filter(txn => txn.matched === "🟡").length}</span>
          </div>

        ) : (
          <div className="text-sm text-gray-500 italic mb-2">
            No smart transactions available.
          </div>
        )}



        <div className="mb-4 text-sm text-yellow-300">{status}</div>

        {sTransactions.length === 0 && (
          <button
            onClick={handleCopyTransactions}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
          >
            📋 Copy Transactions
          </button>
        )}

        {sTransactions.length > 0 && (
          <SmartCategorizeTable transactions={sTransactions} />
        )}
      </div>
    </div>
  );
};

export default SmartCategorizer;
