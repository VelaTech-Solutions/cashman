// src/pages/CategorizeTransactions.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components imports
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import Table from "components/Table"; 
// Firebase Imports
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

const CategorizeTransactions = () => {
  const { id } = useParams(); // Client ID or folder number
  const [bankName, setbankName] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showSummary, setShowSummary] = useState(true);

  // Sidebar Links
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    {
      path: `/client/${id}`,
      label: "Back to Client Profile",
      icon: "ph-file-text",
    },
    {
      path: `/categorysettings`,
      label: "Category Settings",
      icon: "ph-file-text",
    },
    {
      path: `/transactiondatabase/${id}`,
      label: "Transaction Database",
      icon: "ph-file-text",
    },
  ];

  // Load Client Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching client data...");

        // Load client data
        const clientData = await LoadClientData(id);
        console.log("Fetched client data:", clientData);

        // Extract transactions and bank name
        const fetchedTransactions = clientData.transactions.map((txn) => ({
          ...txn,
          bankName: clientData.bankName || "Unknown Bank", // Add bankName to each transaction
        }));
        console.log("bankName:", clientData.bankName);

        // Update state
        setbankName(clientData.bankName || "Unknown Bank");
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);

        // Fetch categories
        console.log("Fetching categories...");
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(fetchedCategories);

        // Process subcategories
        const organizedSubcategories = fetchedCategories.flatMap((category) =>
          category.subcategories
            ? category.subcategories.map((sub) => ({
                id: sub.id,
                name: sub.name,
                parentCategory: category.name,
              }))
            : [],
        );
        setSubcategories(organizedSubcategories);

        console.log("Fetched and processed categories and subcategories.");
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch transactions or categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter subcategories based on the selected category
  useEffect(() => {
    if (category) {
      const filtered = subcategories.filter(
        (sub) => sub.parentCategory === category,
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [category, subcategories]);

  // Filter transactions based on the search query
  useEffect(() => {
    const filtered = transactions.filter(
      (transaction) =>
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.date1?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  // Function to toggle Select All
  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]); // Deselect all
    } else {
      const allIndexes = filteredTransactions.map((_, index) => index);
      setSelectedTransactions(allIndexes); // Select all
    }
  };

  // Check if all transactions are selected
  const isAllSelected =
    filteredTransactions.length > 0 &&
    selectedTransactions.length === filteredTransactions.length;

  // Individual checkbox logic remains the same
  const handleCheckboxChange = (transactionIndex) => {
    setSelectedTransactions((prevSelected) =>
      prevSelected.includes(transactionIndex)
        ? prevSelected.filter((index) => index !== transactionIndex)
        : [...prevSelected, transactionIndex],
    );
  };

  // Categorize selected transactions
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

      console.log("Starting categorization...");
      console.log("Selected Transactions Indices:", selectedTransactions);

      const updatedTransactions = [...transactions];

      selectedTransactions.forEach((transactionIndex) => {
        const originalIndex = transactions.findIndex(
          (txn) => txn === filteredTransactions[transactionIndex],
        );

        if (originalIndex !== -1) {
          updatedTransactions[originalIndex] = {
            ...updatedTransactions[originalIndex],
            category,
            subcategory,
          };

          saveToTransactionDatabase(
            updatedTransactions[originalIndex].bankName, // Pass bankName from transaction
            updatedTransactions[originalIndex].description,
            category,
            subcategory,
          );
        } else {
          console.warn(
            `Transaction at filtered index ${transactionIndex} not found in the original list.`,
          );
        }
      });

      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });

      console.log("Transactions updated successfully:", updatedTransactions);
      alert("Transactions categorized successfully!");

      setTransactions(updatedTransactions);
      setSelectedTransactions([]);
    } catch (err) {
      console.error("Error during categorization:", err.message, err.stack);
      alert(
        "Failed to categorize transactions. Check the console for details.",
      );
    }
  };

  // save transaction
  const saveToTransactionDatabase = async (
    bankName,
    description,
    category,
    subcategory,
  ) => {
    try {
      if (!bankName) {
        throw new Error("Bank name is undefined or missing.");
      }

      console.log(
        `Saving transaction for bank: ${bankName}, description: ${description}`,
      );

      // Dynamically pass the bankName variable into the collection path
      const bankCollectionRef = collection(
        db,
        "transaction_database",
        bankName, // Now dynamically passing the bank name
        "transactions",
      );

      const querySnapshot = await getDocs(bankCollectionRef);
      const existingTransaction = querySnapshot.docs.find(
        (doc) => doc.data().description === description,
      );

      if (existingTransaction) {
        console.log("Transaction already exists. Skipping:", description);
        return;
      }

      await addDoc(bankCollectionRef, {
        description,
        category,
        subcategory,
        createdAt: new Date().toISOString(),
      });

      console.log("Transaction added to database:", {
        description,
        category,
        subcategory,
      });
    } catch (err) {
      console.error("Error saving to transaction database:", err.message);
    }
  };

  // Color Category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Income":
        return "bg-green-600"; // Green for income
      case "Savings":
        return "bg-blue-600"; // Blue for savings
      case "Housing":
        return "bg-purple-600"; // Purple for housing
      case "Transport":
        return "bg-yellow-600"; // Yellow for transport
      case "Expenses":
        return "bg-red-600"; // Red for expenses
      case "Debt":
        return "bg-gray-700"; // Dark gray for debt
      default:
        return "bg-gray-800"; // Default gray if category is unknown
    }
  };

  // Clear All Category
  const clearAllCategories = async () => {
    try {
      console.log("Clearing all categories and subcategories...");

      // Clone the transactions array and remove categories
      const updatedTransactions = transactions.map((transaction) => ({
        ...transaction,
        category: "",
        subcategory: "",
      }));

      // Update the Firestore document
      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });

      console.log("All categories and subcategories cleared.");
      alert("All transactions cleared successfully!");

      // Update state
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error clearing categories:", err.message);
      alert("Failed to clear categories.");
    }
  };

  // Match all Transactions
  const matchAllTransactions = async () => {
    try {
      if (!bankName) {
        alert("Bank name is missing. Unable to match transactions.");
        return;
      }

      console.log("Starting Match-All...");

      // Reference to the transaction database for the specific bank
      const bankCollectionRef = collection(
        db,
        "transaction_database",
        bankName,
        "transactions",
      );

      // Fetch existing transactions from Firestore
      const querySnapshot = await getDocs(bankCollectionRef);
      const transactionDatabase = querySnapshot.docs.map((doc) => doc.data());

      if (transactionDatabase.length === 0) {
        alert("No transactions found in the database.");
        return;
      }

      console.log("Fetched transaction database:", transactionDatabase);

      // Update local transactions based on matched descriptions
      const updatedTransactions = transactions.map((txn) => {
        const matchingTxn = transactionDatabase.find(
          (dbTxn) => dbTxn.description === txn.description,
        );

        if (matchingTxn) {
          console.log(
            `Matched: ${txn.description} -> ${matchingTxn.category}, ${matchingTxn.subcategory}`,
          );
          return {
            ...txn,
            category: matchingTxn.category,
            subcategory: matchingTxn.subcategory,
          };
        }
        return txn;
      });

      // Update transactions in Firestore
      const clientDocRef = doc(db, "clients", id);
      await updateDoc(clientDocRef, { transactions: updatedTransactions });

      console.log("Match-All complete. Transactions updated.");
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
                    R{" "}
                    {transactions
                      .filter(
                        (txn) =>
                          txn.credit_amount &&
                          (txn.category === "Income" || !txn.category),
                      )
                      .reduce((acc, txn) => acc + txn.credit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Savings */}
                <div className="bg-blue-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Savings</p>
                  <p className="text-lg font-bold">
                    R{" "}
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Savings",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Housing */}
                <div className="bg-purple-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Housing</p>
                  <p className="text-lg font-bold">
                    R{" "}
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Housing",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Transport */}
                <div className="bg-yellow-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Transport</p>
                  <p className="text-lg font-bold">
                    R{" "}
                    {transactions
                      .filter(
                        (txn) =>
                          txn.debit_amount && txn.category === "Transportation",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-red-600 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Expenses</p>
                  <p className="text-lg font-bold">
                    R{" "}
                    {transactions
                      .filter(
                        (txn) =>
                          txn.debit_amount && txn.category === "Expenses",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* Total Debt */}
                <div className="bg-gray-700 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Debt</p>
                  <p className="text-lg font-bold">
                    R{" "}
                    {transactions
                      .filter(
                        (txn) => txn.debit_amount && txn.category === "Debt",
                      )
                      .reduce((acc, txn) => acc + txn.debit_amount, 0)
                      .toFixed(2)}
                  </p>
                </div>

                {/* 🔹 Total Transactions */}
                <div className="bg-gray-500 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>

                {/* 🔹 Total Uncategorized */}
                <div className="bg-gray-500 p-3 rounded-lg shadow-md">
                  <p className="text-sm">Total Uncategorized</p>
                  <p className="text-lg font-bold">
                    {
                      transactions.filter(
                        (txn) =>
                          !txn.category || txn.category === "Uncategorized",
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search transactions by date or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="text-sm text-gray-400 mb-2">
          This is a short description for the user. Select one transaction and
          run the
          <strong> Match All</strong> function or use the{" "}
          <strong>Match All Transactions </strong>
          button for the best results. Try matching one transaction first, then
          match all transactions.
        </p>

        {/* Category and Subcategory Select */}
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

        {/* Transactions Table */}
        <div className="overflow-y-auto max-h-[500px] gap-4 mb-4 shadow-md border border-gray-700 rounded-lg">
          <Table className="w-full bg-gray-800">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Debit</th>
                <th className="p-2">Credit</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Category</th>
                <th className="p-2">Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td className="p-2">{transaction.date1 || "-"}</td>
                  <td className="p-2">{transaction.description || "-"}</td>
                  <td className="p-2">{transaction.debit_amount || "-"}</td>
                  <td className="p-2">{transaction.credit_amount || "-"}</td>
                  <td className="p-2">{transaction.balance_amount || "-"}</td>
                  <td className="p-2">{transaction.category || "-"}</td>
                  <td className="p-2">{transaction.subcategory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Transactions Table with Scrollable Body */}
        <div className="overflow-y-auto max-h-[500px] gap-4 mb-4 shadow-md border border-gray-700 rounded-lg">
          <table className="w-full bg-gray-800">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Debit</th>
                <th className="p-2">Credit</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Category</th>
                <th className="p-2">Subcategory</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {filteredTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-700 text-white ${getCategoryColor(transaction.category)}`}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>
                  <td className="p-2">{transaction.date1 || "-"}</td>
                  <td className="p-2">{transaction.description || "-"}</td>
                  <td className="p-2">{transaction.debit_amount || "-"}</td>
                  <td className="p-2">{transaction.credit_amount || "-"}</td>
                  <td className="p-2">{transaction.balance_amount || "-"}</td>
                  <td
                    className={`p-2 text-white ${getCategoryColor(transaction.category)}`}
                  >
                    {transaction.category || "-"}
                  </td>
                  <td className="p-2">{transaction.subcategory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Colored Transactions Table */}
        <div className="overflow-y-auto max-h-[500px] gap-4 mb-4 shadow-md border border-gray-700 rounded-lg">
          <Table className="w-full bg-gray-800">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-2">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Debit</th>
                <th className="p-2">Credit</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Category</th>
                <th className="p-2">Subcategory</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {filteredTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-700 text-white`}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(index)}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </td>

                  <td className="p-2">{transaction.date1 || "-"}</td>
                  <td className="p-2">{transaction.description || "-"}</td>
                  <td className="p-2">{transaction.debit_amount || "-"}</td>
                  <td className="p-2">{transaction.credit_amount || "-"}</td>
                  <td className="p-2">{transaction.balance_amount || "-"}</td>
                  <td
                    className={`p-2 ${getCategoryColor(transaction.category)}`}
                  >
                    {transaction.category || "-"}
                  </td>
                  <td className="p-2">{transaction.subcategory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CategorizeTransactions;
