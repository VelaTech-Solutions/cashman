import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import LoadClientData from "../components/LoadClientData"; // Import the fetch function
const CategorizeTransactions = () => {
  const { id } = useParams(); // Client ID or folder number
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
  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load client data using the reusable function
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
        console.log("Fetched client data:", clientData);

        // Extract transactions and bank name from the client document
        const fetchedTransactions = clientData.transactions || [];
        const bankName = clientData.bankName;

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
            updatedTransactions[originalIndex].bankName,
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
      const bankCollectionRef = collection(
        db,
        "transaction_database",
        bankName,
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Categorize Transactions" links={links} />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Categorize Transactions</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search transactions by date or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
        <table className="w-full table-auto bg-gray-800 rounded shadow-md">
          <thead>
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
        </table>
      </div>
    </div>
  );
};

export default CategorizeTransactions;
