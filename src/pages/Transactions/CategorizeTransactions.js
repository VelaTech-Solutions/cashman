// src/pages/CategorizeTransactions.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Firebase
import { db } from "../../firebase/firebase";
import { doc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";

// Component Imports
import { Sidebar, LoadClientData } from 'components/Common';
import NormalCategorizer from "components/Transactions/CategorizeTransactions/NormalCategorizePage";
import SmartCategorizer from "components/Transactions/CategorizeTransactions/SmartCategorizePage";
import AICategorizer from "components/Transactions/CategorizeTransactions/AICategorizePage";

const CategorizeTransactions = () => {
  const { id } = useParams();
  const [activePage, setActivePage] = useState("NormalCategorizer");

  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown Bank");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Transactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("NormalCategorizer")}
          className="w-full text-left px-4 py-2 mb-2 bg-blue-500 hover:bg-blue-600 text-black rounded transition-all"
        >
          Normal Categorizer
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("SmartCategorizer")}
          className="w-full text-left px-4 py-2 mb-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded transition-all"
        >
          Smart Categorizer
        </button>
      ),
    },
    {
      type: "custom",
      content: (
        <button
          onClick={() => setActivePage("AICategorizer")}
          className="w-full text-left px-4 py-2 mb-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-all"
        >
          AI Categorizer
        </button>
      ),
    },
    { type: "divider" },
    { path: `/categorysettings/${id}`, label: "Category Settings", icon: "ph-file-text" },
    { path: "/HelpCategory", label: "Category Help", icon: "ph-file-text" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        const fetchedTransactions = (clientData.transactions || []).map((txn) => ({
          ...txn,
          bankName: clientData.bankName || "Unknown Bank",
        }));
        setClientData(clientData);
        setBankName(clientData.bankName || "Unknown Bank");
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(fetchedCategories);

        const organizedSubcategories = fetchedCategories.flatMap((cat) =>
          cat.subcategories
            ? cat.subcategories.map((sub) => ({
                id: sub.id,
                name: sub.name,
                parentCategory: cat.name,
              }))
            : []
        );
        setSubcategories(organizedSubcategories);
      } catch (err) {
        setError("Failed to fetch transactions or categories.");
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (category) {
      const filtered = subcategories.filter((sub) => sub.parentCategory === category);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [category, subcategories]);

  useEffect(() => {
    const filtered = transactions.filter(
      (txn) =>
        txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.date1?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  const categorize = async () => {
    try {
      if (!category || !subcategory) {
        alert("Please select both a category and a subcategory.");
        return;
      }

      if (selectedTransactions.length === 0) {
        alert("No transactions selected for categorization.");
        return;
      }

      const updatedTransactions = [...transactions];
      selectedTransactions.forEach((globalIndex) => {
        if (globalIndex >= 0 && globalIndex < updatedTransactions.length) {
          updatedTransactions[globalIndex] = {
            ...updatedTransactions[globalIndex],
            category,
            subcategory,
          };
          saveToTransactionDatabase(
            updatedTransactions[globalIndex].bankName,
            updatedTransactions[globalIndex].description,
            category,
            subcategory
          );
        }
      });

      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });
      alert("Transactions categorized successfully!");
      setTransactions(updatedTransactions);
      setSelectedTransactions([]);
    } catch (err) {
      alert("Failed to categorize transactions. Check console.");
    }
  };

  const saveToTransactionDatabase = async (bankName, description, category, subcategory) => {
    try {
      if (!bankName) throw new Error("Bank name is undefined");
      const bankRef = collection(db, "transaction_database", bankName, "transactions");
      const querySnapshot = await getDocs(bankRef);
      const exists = querySnapshot.docs.find((doc) => doc.data().description === description);
      if (exists) return;

      await addDoc(bankRef, {
        description,
        category,
        subcategory,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving to DB:", err.message);
    }
  };

  const clearAllCategories = async () => {
    try {
      const cleared = transactions.map((txn) => ({ ...txn, category: "", subcategory: "" }));
      await updateDoc(doc(db, "clients", id), { transactions: cleared });
      setTransactions(cleared);
      alert("All transactions cleared.");
    } catch (err) {
      alert("Failed to clear categories.");
    }
  };

  const matchAllTransactions = async () => {
    try {
      const bankRef = collection(db, "transaction_database", bankName, "transactions");
      const querySnapshot = await getDocs(bankRef);
      const transactionDatabase = querySnapshot.docs.map((doc) => doc.data());

      const updated = transactions.map((txn) => {
        const match = transactionDatabase.find((dbTxn) => dbTxn.description === txn.description);
        return match
          ? { ...txn, category: match.category, subcategory: match.subcategory }
          : txn;
      });

      await updateDoc(doc(db, "clients", id), { transactions: updated });
      setTransactions(updated);
      alert("Matching transactions categorized.");
    } catch (err) {
      alert("Failed to match transactions.");
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Categorize Transactions" links={links} />
      <div className="flex-1 p-8">
        {/* <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1> */}
        {activePage === "NormalCategorizer" && (
          <NormalCategorizer
            transactions={transactions}
            setTransactions={setTransactions}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
            categories={categories}
            subcategories={subcategories}
            filteredSubcategories={filteredSubcategories}
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCategorize={categorize}
            onMatchAll={matchAllTransactions}
            onClear={clearAllCategories}
          />
        )}
        {activePage === "SmartCategorizer" && (
          <SmartCategorizer transactions={transactions} clientId={id} />
        )}
        {activePage === "AICategorizer" && (
          <AICategorizer transactions={transactions} clientId={id}/>
        )}
      </div>
    </div>
  );
};

export default CategorizeTransactions;
