// src/pages/CategorizeTransactions.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components imports
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import CategorizeActions from "../../components/Transactions/CategorizeTransactions/CategorizeActions";
import CategorizeOverviewContainer from "../../components/Transactions/CategorizeTransactions/CategorizeOverviewContainer";
import CategorizeTablesContainer from "../../components/Transactions/CategorizeTransactions/CategorizeTablesContainer";

// Firebase Imports
import { db } from "../../firebase/firebase";
import { doc, updateDoc, collection, getDocs, addDoc, } from "firebase/firestore";

const CategorizeTransactions = () => {
  const { id } = useParams();
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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}/transactionspage`, label: "Back to Tansactions", icon: "ph-file-text" },
    { path: `/client/${id}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" }, // Divider line
    { path: `/categorysettings/${id}`,
      label: "Category Settings",
      icon: "ph-file-text",
    },
    { path: "/HelpCategory",
    label: "Category Help",
    icon: "ph-file-text",
  },
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
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch transactions or categories.");
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (category) {
      const filtered = subcategories.filter(
        (sub) => sub.parentCategory === category
      );
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
      console.error("Error during categorization:", err.message, err.stack);
      alert("Failed to categorize transactions. Check the console for details.");
    }
  };

  const saveToTransactionDatabase = async (
    bankName,
    description,
    category,
    subcategory
  ) => {
    try {
      if (!bankName) {
        throw new Error("Bank name is undefined or missing.");
      }
      const bankCollectionRef = collection(
        db,
        "transaction_database",
        bankName,
        "transactions"
      );
      const querySnapshot = await getDocs(bankCollectionRef);
      const existingTransaction = querySnapshot.docs.find(
        (doc) => doc.data().description === description
      );

      if (existingTransaction) return;

      await addDoc(bankCollectionRef, {
        description,
        category,
        subcategory,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving to transaction database:", err.message);
    }
  };

  const clearAllCategories = async () => {
    try {
      const updatedTransactions = transactions.map((txn) => ({
        ...txn,
        category: "",
        subcategory: "",
      }));

      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });
      alert("All transactions cleared successfully!");
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error clearing categories:", err.message);
      alert("Failed to clear categories.");
    }
  };

  const matchAllTransactions = async () => {
    try {
      if (!bankName) {
        alert("Bank name is missing. Unable to match transactions.");
        return;
      }

      const bankCollectionRef = collection(
        db,
        "transaction_database",
        bankName,
        "transactions"
      );
      const querySnapshot = await getDocs(bankCollectionRef);
      const transactionDatabase = querySnapshot.docs.map((doc) => doc.data());

      if (transactionDatabase.length === 0) {
        alert("No transactions found in the database.");
        return;
      }

      const updatedTransactions = transactions.map((txn) => {
        const matchingTxn = transactionDatabase.find(
          (dbTxn) => dbTxn.description === txn.description
        );
        if (matchingTxn) {
          return {
            ...txn,
            category: matchingTxn.category,
            subcategory: matchingTxn.subcategory,
          };
        }
        return txn;
      });

      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });
      setTransactions(updatedTransactions);
      alert("All matching transactions have been categorized.");
    } catch (err) {
      console.error("Error in Match-All:", err.message);
      alert("Failed to match transactions.");
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Categorize Transactions" links={links} />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>
          <CategorizeOverviewContainer transactions={transactions} />

          <p className="text-sm text-gray-400 mb-2">
            This is a short description for the user. Select one transaction and run the
            <strong> Match All</strong> function or use the
            <strong> Match All Transactions </strong>
            button for the best results.
          </p>

          <CategorizeActions
            search={setSearchQuery}
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            categories={categories}
            filteredSubcategories={filteredSubcategories}
            onMatchAll={matchAllTransactions}
            onCategorize={categorize}
            onClear={clearAllCategories}
          />

          <CategorizeTablesContainer             
            transactions={transactions}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
          />
      </div>
    </div>
  );
};

export default CategorizeTransactions;
