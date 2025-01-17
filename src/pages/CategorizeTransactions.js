import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/tailwind.css";
import { motion } from "framer-motion";

const CategorizeTransactions = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClientData(docSnap.data());
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to fetch client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const handleCategoryChange = async (transactionId, newCategory) => {
    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, { category: newCategory });
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, category: newCategory } : tx,
        ),
      );
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  const handleSubcategoryChange = async (transactionId, newSubcategory) => {
    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, { subcategory: newSubcategory });
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, subcategory: newSubcategory } : tx,
        ),
      );
    } catch (error) {
      console.error("Error updating subcategory: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  //
  // Filter transactions based on search query
  const filteredTransactions = clientData?.transactions?.filter(
    (transaction) => {
      return (
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.date1?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <motion.div
        className="lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg hidden lg:block"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4 pt-4">
          <h1 className="text-2xl font-bold text-blue-400">
            Cash Flow Manager
          </h1>
        </div>

        <nav className="space-y-4 border-t border-gray-700 pt-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 hover:text-white transition"
          >
            Back to Dashboard
            <i className="ph-check-square text-xl"></i>
          </Link>

          <Link
            to={`/client/${id}`}
            className="flex items-center space-x-3 hover:text-white transition"
          >
            Back to Client Profile
            <i className="ph-check-square text-xl"></i>
          </Link>
          {/* Line */}
          <div className="border-t border-gray-700"></div>

          {/* Category Settings modification for categorization */}
          <Link
            to="/categorysettings"
            className="flex items-center space-x-3 hover:text-white transition"
          >
            Category Settings
            <i className="ph-check-square text-xl"></i>
          </Link>

          {/* Modify Manage Transactions Knowledge Base */}
          <Link
            //to="/Knowledgebase" still need to create page
            className="flex items-center space-x-3 hover:text-white transition"
          >
            Manage Transactions Knowledge Database
            <i className="ph-check-square text-xl"></i>
          </Link>
        </nav>
      </motion.div>

      {/* Main Content */}

      <div className="flex-1 p-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            Categorize Transactions
          </h1>
        </header>

        {/* Overview Section */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">
            Categorized Overview
          </h2>

          {/* Cards for Total Transactions, Needs Review, and Categorized Transactions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Total Transactions
              </p>
              <p className="text-3xl font-bold text-white">
                {clientData.transactions?.length || 0}
              </p>
            </div>

            {/* Card for needs review in db*/}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">Needs Review</p>
              <p className="text-3xl font-bold text-white">
                {/* Placeholder for what? */}0
              </p>
            </div>

            {/* Card for Categorized Transactions in db*/}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Transactions Categorized{" "}
              </p>
              <p className="text-3xl font-bold text-white">
                {clientData.transactions.categoried?.length || 0}
              </p>
            </div>

            {/* Card for Known Categoried Transactions in db*/}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Known Categories
              </p>
              <p className="text-3xl font-bold text-white">
                {/* Placeholder for what? */}0
                {/* Create the logic to count the number of known categorized transactions */}
                {/* {categoriedTransactionData.categorieddata?.length || 0} */}
              </p>
            </div>

            {/* Card for Total Categorized Amount */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-blue-400">
                Total Categorized Amount
              </p>
              <p className="text-3xl font-bold text-white">
                {clientData.transactions.categorizedAmount?.toFixed(2) ||
                  "0.00"}
              </p>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="mt-8">
          <input
            type="text"
            placeholder="Search transactions by date or description..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        {/* Transactions Table */}
        <section className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
          {filteredTransactions?.length > 0 ? (
            <div className="overflow-y-auto h-96">
              <table className="table-auto w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-sm">Date1</th>
                    <th className="px-4 py-2 text-sm">Date2</th>
                    <th className="px-4 py-2 text-sm">Description</th>
                    <th className="px-4 py-2 text-sm">Fee Type</th>
                    <th className="px-4 py-2 text-sm">Fee Amount</th>
                    <th className="px-4 py-2 text-sm">Credit Amount</th>
                    <th className="px-4 py-2 text-sm">Debit Amount</th>
                    <th className="px-4 py-2 text-sm">Balance Amount</th>
                    <th className="px-4 py-2 text-sm">Category</th>
                    <th className="px-4 py-2 text-sm">Subcategory</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="px-4 py-2 text-sm">{transaction.date1}</td>
                      <td className="px-4 py-2 text-sm">{transaction.date2}</td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.fee_type}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.fee_amount
                          ? `R ${transaction.fee_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.credit_amount
                          ? `R ${transaction.credit_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.debit_amount
                          ? `R ${transaction.debit_amount.toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.balance_amount
                          ? `R ${transaction.balance_amount.toFixed(2)}`
                          : "-"}
                      </td>

                      {/* Category and Subcategory in firebase are named categories  */}
                      <td className="px-4 py-2 text-sm">
                        <select
                          value={transaction.category || ""}
                          onChange={(e) =>
                            handleCategoryChange(transaction.id, e.target.value)
                          }
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Category and Subcategory in firebase are named subcategories  */}
                      <td className="px-4 py-2 text-sm"></td>
                      <select
                        value={transaction.subcategory || ""}
                        onChange={(e) =>
                          handleSubcategoryChange(
                            transaction.id,
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </tr>

                    // categories and subcategories are not being displayed
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">
              No transactions found.
            </p>
          )}
        </section>

        {/* Automatic Categorization Button */}
        <section className="mt-8">
          <button
            // onClick={handleAutomaticCategorization}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Automatic Categorization
          </button>
        </section>
      </div>
    </div>
  );
};
export default CategorizeTransactions;
