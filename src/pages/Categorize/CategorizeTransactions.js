// src/pages/CategorizeTransactions.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components imports
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import CategorizeTables from "components/CategorizeTables";
import Button from "components/Button";

// Firebase Imports
import { db } from "../../firebase/firebase";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

const CategorizeTransactions = () => {
  const { id } = useParams();
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
  const [showSummary, setShowSummary] = useState(true);

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${id}`, label: "Back to Client Profile", icon: "ph-file-text" },
    { path: `/categorysettings`, label: "Category Settings", icon: "ph-file-text" },
    { path: `/transactiondatabase/${id}`, label: "Transaction Database", icon: "ph-file-text" },
    { label: "Budget", path: `/budget/${id}` },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        const fetchedTransactions = (clientData.transactions || []).map((txn) => ({
          ...txn,
          bankName: clientData.bankName || "Unknown Bank",
        }));

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

        {/* Financial Summary Section */}
        <section className="space-y-4">
          <h2
            onClick={() => setShowSummary(!showSummary)}
            className="text-xl font-semibold border-b border-gray-600 pb-2 cursor-pointer flex justify-between items-center"
          >
            Financial Summary
            <span className="text-gray-500">{showSummary ? "▲" : "▼"}</span>
          </h2>

          {showSummary && (
            <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* Total Income */}
                <div className="bg-green-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Income</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter(
                        (txn) =>
                          parseFloat(txn.credit_amount) > 0 &&
                          (txn.category === "Income" || !txn.category)
                      )
                      .reduce(
                        (acc, txn) => acc + (parseFloat(txn.credit_amount) || 0),
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Savings */}
                <div className="bg-blue-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Savings</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter((txn) => txn.category === "Savings")
                      .reduce((acc, txn) => {
                        const amount =
                          parseFloat(txn.debit_amount) ||
                          parseFloat(txn.credit_debit_amount) ||
                          0;
                        return acc + Math.abs(amount);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Housing */}
                <div className="bg-purple-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Housing</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter((txn) => txn.category === "Housing")
                      .reduce((acc, txn) => {
                        const amount =
                          parseFloat(txn.debit_amount) ||
                          parseFloat(txn.credit_debit_amount) ||
                          0;
                        return acc + Math.abs(amount);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Transport */}
                <div className="bg-yellow-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Transportation</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter((txn) => txn.category === "Transportation")
                      .reduce((acc, txn) => {
                        const amount =
                          parseFloat(txn.debit_amount) ||
                          parseFloat(txn.credit_debit_amount) ||
                          0;
                        return acc + Math.abs(amount);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-red-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Expenses</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter((txn) => txn.category === "Expenses")
                      .reduce((acc, txn) => {
                        const amount =
                          parseFloat(txn.debit_amount) ||
                          parseFloat(txn.credit_debit_amount) ||
                          0;
                        return acc + Math.abs(amount);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>


                {/* Total Debt */}
                <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Debt</p>
                  <p className="text-lg font-bold">
                    R
                    {transactions
                      .filter((txn) => txn.category === "Debt")
                      .reduce((acc, txn) => {
                        const amount =
                          parseFloat(txn.debit_amount) ||
                          parseFloat(txn.credit_debit_amount) ||
                          0;
                        return acc + Math.abs(amount);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Transactions */}
                <div className="bg-gray-500 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>

                {/* Total Uncategorized */}
                <div className="bg-gray-500 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Uncategorized</p>
                  <p className="text-lg font-bold">
                    {transactions.filter(
                      (txn) => !txn.category || txn.category === "Uncategorized"
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>


        <input
          type="text"
          placeholder="Search transactions by date or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="text-sm text-gray-400 mb-2">
          This is a short description for the user. Select one transaction and run the
          <strong> Match All</strong> function or use the
          <strong> Match All Transactions </strong>
          button for the best results.
        </p>

        <div className="flex gap-4 mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white"
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>

          <button
            onClick={matchAllTransactions}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Match All Transactions
          </button>

          <button
            onClick={categorize}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Categorize Selected
          </button>

          <button
            onClick={clearAllCategories}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear All Categories
          </button>
        </div>

        <div className="p-4">
          <CategorizeTables
            transactions={transactions}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
          />
        </div>
      </div>
    </div>
  );
};

export default CategorizeTransactions;
