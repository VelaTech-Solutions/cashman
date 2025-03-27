import React from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const SmartCategorizeActions = ({
  transactions,
  setTransactions,
  clientId,
  setStatus,
  onClearSmart,
  search,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  categories,
  filteredSubcategories,
}) => {


  const handleSmartMatch = async () => {
    try {
      setStatus("Running smart match...");
  
      const clientDocRef = doc(db, "clients", clientId);
      const clientSnapshot = await getDoc(clientDocRef);
      const clientData = clientSnapshot.data();
      const smartTxns = clientData.sTransactions || [];
      const bankName = clientData.bankName || "";
      const bankRef = collection(db, "transaction_database", bankName, "transactions");
      const querySnapshot = await getDocs(bankRef);
      const dbTxns = querySnapshot.docs.map((doc) => doc.data());
  
      const keywordCounts = {};
      dbTxns.forEach((t) => {
        const words = t.description?.toLowerCase().split(" ") || [];
        words.forEach((word) => {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1;
        });
      });
  
      const updated = smartTxns.map((txn) => {
        const desc = txn.description?.toLowerCase() || "";
        const words = desc.split(" ");
        const matched_keywords = words.filter((word) => keywordCounts[word]);
        const isExactMatch = dbTxns.some((db) => db.description === txn.description);
  
        let matched = "🔴";
        let matched_category = "";
        let matched_subcategory = "";
        let match_percent = 0;
  
        if (isExactMatch) {
          matched = "🟢";
        } else if (matched_keywords.length > 0) {
          matched = "🟡";
          match_percent = Math.round((matched_keywords.length / words.length) * 100);
  
          const match = dbTxns.find((db) =>
            matched_keywords.some((word) =>
              db.description?.toLowerCase().includes(word)
            )
          );
  
          if (match) {
            matched_category = match.category;
            matched_subcategory = match.subcategory;
          }
        }
  
        return {
          ...txn,
          matched,
          matched_keywords,
          match_percent,
          matched_category,
          matched_subcategory
        };
      });
  
      await updateDoc(clientDocRef, { sTransactions: updated });
      const updatedDoc = await getDoc(clientDocRef);
      const newTransactions = updatedDoc.data().sTransactions || [];
      setTransactions(newTransactions);
      setStatus("Smart match done 👍");
    } catch (error) {
      console.error("Smart match failed:", error);
      setStatus("❌ Smart match failed");
    }
  };
  
  
  

  const onSmartCategorize = async () => {
    try {
      setStatus("Running smart categorize...");
  
      const clientDocRef = doc(db, "clients", clientId);
      const updated = transactions.map((txn) => {
        // Add fuzzy logic here later
        return { ...txn }; // Placeholder
      });
  
      await updateDoc(clientDocRef, { sTransactions: updated });
      setStatus("Smart categorize done ✅");
    }
    catch (error) {
      console.error("Smart categorize failed:", error);
      setStatus("❌ Smart categorize failed");
    }
  }

  const onDeleteSmart = async () => {
    try {
      setStatus("Deleting smart transactions...");
      const clientDocRef = doc(db, "clients", clientId);
      await updateDoc(clientDocRef, { sTransactions: [] });
      setTransactions([]);
      setStatus("Smart transactions deleted 🗑️");
    }
    catch (error) {
      console.error("Failed to delete smart transactions:", error);
      setStatus("❌ Failed to delete smart transactions");
    }
  }
  
  // Clean Description just remove numbers and special characters and convert to lowercase
  const handleCleanDesc = async () => {
    try {
      setStatus("Cleaning description...");
      const updated = transactions.map((txn) => {
        const cleanedDesc = txn.description
          .replace(/[^a-zA-Z ]/g, "")
          .replace(/\d+/g, "")
          .toLowerCase()
          .trim();
        return { ...txn, description: cleanedDesc };
      });
      const clientDocRef = doc(db, "clients", clientId);
      await updateDoc(clientDocRef, { sTransactions: updated });
      const updatedDoc = await getDoc(clientDocRef);
      const newTransactions = updatedDoc.data().sTransactions || [];
      setTransactions(newTransactions);
      setStatus("Description cleaned 🧼");
    }
    catch (error) {
      console.error("Failed to clean description:", error);
      setStatus("❌ Failed to clean description");
    }
  }

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-md flex items-center gap-4">

      {/* Search Input */}
      <input
        type="text"
        placeholder="🔍 Smart Search..."
        onChange={(e) => search(e.target.value)}
        className="flex-1 min-w-[150px] p-2 text-sm rounded bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400"
      />

      {/* Category Dropdown */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 text-sm rounded bg-gray-700 text-white"
      >
        <option value="">Category</option>
        {(categories || []).map((cat) => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      {/* Subcategory Dropdown */}
      <select
        value={subcategory}
        onChange={(e) => setSubcategory(e.target.value)}
        className="p-2 text-sm rounded bg-gray-700 text-white"
      >
        <option value="">Subcategory</option>
        {(filteredSubcategories || []).map((sub) => (
          <option key={sub.id} value={sub.name}>{sub.name}</option>
        ))}
      </select>


      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleCleanDesc}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 text-xs rounded-lg transition-all"
        >
          🧼 Clean Description
        </button>
        <button
          onClick={handleSmartMatch}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 text-xs rounded-lg transition-all"
        >
          🤖 Smart Match
        </button>
        <button
          onClick={onSmartCategorize}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 text-xs rounded-lg transition-all"
        >
          ⚡ Smart Categorize
        </button>
        <button
          onClick={onClearSmart}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-xs rounded-lg transition-all"
        >
          🧹 Clear Smart Tags
        </button>
        <button
          onClick={onDeleteSmart}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-xs rounded-lg transition-all"
        >
          🗑️ Delete Smart Transactions
        </button>

      </div>
    </div>
  );
};

export default SmartCategorizeActions;
