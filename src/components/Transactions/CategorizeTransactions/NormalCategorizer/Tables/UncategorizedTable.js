import React, { useState, useMemo, useEffect } from "react";

import { doc, setDoc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Compon
import { 
  LoadClientData, 
  CategoryColor, 
  Loader,
  loadCategories, 
  loadSubcategories,
  loadTransactionDatebase } from "components/Common";
import { addTransactionDatabase } from "components/Common";

const UncategorizedTable = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [groupBy, setGroupBy] = useState("category");
  const [currentTab, setCurrentTab] = useState("table1");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 12;

  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [transactionDb, setTransactionDb] = useState([]);

  // Fetch client data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("Client not found.");
        } else {
          setClientData(data);
          setBankName(data.bankName);

          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
      } catch (err) {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // console.log("Bank name", bankName)


  // load transaction database
  useEffect(() => {
    const fetchTransactionDb = async () => {
      try {
        const transactionsData = await loadTransactionDatebase(bankName);
        setTransactionDb(transactionsData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      }
    };

    fetchTransactionDb();
  }, [bankName]);

  // console.log("transaction db",transactionDb)


// Compare client transactions against the transaction database = potential matches
// Check potential matches for transactions using the transaction database
// hinking of changing this up, just checking in the transaction database description basicly the transactionDB.description agaist the client transactions.description
const checkPotentialMatches = () => {
  const potentialMatches = transactions.filter((txn) =>
    transactionDb.some((dbTxn) => dbTxn.description === txn.description)
  );
  return potentialMatches;
};

// console.log ("potential matches", potentialMatches)

// Potential matches are just for display


  // Load categories once on mount
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

console.log("cat", categories)// want to see what cat is selected

// the select part
{/* <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
<option value="">Category</option>
{categories.map((cat) => (
  <option key={cat.id} value={cat.id}>{cat.name}</option>
))}
</select> */}


  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!category) return;
      const subs = await loadSubcategories(category);
      setSubcategories(subs);
    };
    fetchSubs();
  }, [category]);

  // Group transactions by category or description
  const toggleGroupBy = () => {
    setGroupBy((prev) => (prev === "category" ? "description" : "category"));
    setCurrentPage(1);
  };

  // Filter by Uncategorized Transactions
  const filterUncategorizedTransactions = (transactions) =>{
    return transactions.filter(txn => {
      return !txn.category || !txn.subcategory;
    });
  };

  const uncategorizedTransactions = filterUncategorizedTransactions(transactions);
  // Filter valid transactions based on the required fields
  const filterValidTransactions = (transactions) => {
    return transactions.filter(txn => {
      return txn.date1 &&
        txn.description &&
        (txn.credit_amount || txn.debit_amount) &&
        txn.balance_amount;
    });
  };

  // Filtered transactions: Only valid ones will be shown here
  const validTransactions = useMemo(() => filterValidTransactions(transactions), [transactions]);

  // Group and flatten transactions
  const groupedAndFlattened = useMemo(() => {
    const grouped = uncategorizedTransactions.reduce((acc, txn) => {
      const key = groupBy === "description"
        ? txn.description || "No Description"
        : txn.category || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {});

    let flat = [];
    Object.entries(grouped).forEach(([groupKey, txns]) => {
      flat.push({ isHeader: true, groupKey });
      flat.push(...txns);
    });

    return flat;
  }, [uncategorizedTransactions, groupBy]);

  // Pagination
  const totalPages = Math.ceil(groupedAndFlattened.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = groupedAndFlattened.slice(startIndex, startIndex + rowsPerPage);

  const handleCheckboxChange = (uid) => {
    if (!uid) return;
    setSelectedTransactions(prev => {
      const newSelected = prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid];
      
      // Full transaction objects
      const selectedObjects = currentItems.filter(item => newSelected.includes(item.uid));
      console.log("Selected Transactions (full):", selectedObjects);
      
      return newSelected;
    });
  };
  
  const isGroupFullySelected = (groupKey) => {
    const groupItems = currentItems.filter(item => item.groupKey === groupKey && !item.isHeader);
    return groupItems.every(item => selectedTransactions.includes(item.uid));
  };
  
  const handleToggleGroup = (groupKey) => {
    const groupItems = currentItems.filter(item => item.groupKey === groupKey && !item.isHeader);
    const groupUids = groupItems.map(item => item.uid);
  
    const isFullySelected = groupUids.every(uid => selectedTransactions.includes(uid));
  
    setSelectedTransactions(prev => {
      if (isFullySelected) {
        return prev.filter(uid => !groupUids.includes(uid));
      } else {
        return [...prev, ...groupUids.filter(uid => !prev.includes(uid))];
      }
    });
  };
  

  const handleCategorizeClick = async () => {
    const selectedTxns = transactions.filter(txn => selectedTransactions.includes(txn.uid));
    if (selectedTxns.length === 0) return;
  
    // Get category and subcategory names from selected ID
    const selectedCategory = categories.find(cat => cat.id === category);
    const selectedSubcategory = subcategories.find(sub => sub.id === subcategory);
  
    const payload = {
      category: selectedCategory ? selectedCategory.name : "",  // Use name instead of id
      subcategory: selectedSubcategory ? selectedSubcategory.name : "",  // Use name instead of id
      description: selectedTxns[0].description || "",
      createdAt: new Date().toISOString(),
    };
  
    try {
      // 1. Add to transaction database
      await addTransactionDatabase(bankName, payload);
  
      // 2. Update client data locally
      const updated = transactions.map(txn => {
        if (selectedTransactions.includes(txn.uid)) {
          return { ...txn, category: payload.category, subcategory: payload.subcategory };
        }
        return txn;
      });
      setTransactions(updated);
  
      // 3. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });
  
      console.log("Updated selected transactions with:", payload);
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };
  
  
  
  // clear the field txn.category and txn.subcategory in client transaction
  // clear the field txn.category and txn.subcategory in all transactions
  const handleClearCategorized = async () => {
    try {
      const updated = transactions.map(txn => ({
        ...txn,
        category: "",
        subcategory: ""
      }));

      setTransactions(updated);

      // 3. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });

      console.log("Reset all Cat and Subcat");
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };


  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;
  console.log("Selected Category:", categories.find(cat => cat.id === category)); 

  return (
    <div className="text-white">
<span className="text-sm text-gray-400">
  {groupedAndFlattened.length} transactions, {checkPotentialMatches().length} potential matches
</span>

      <div className="flex border-b border-gray-700 mb-4 justify-between items-center">
        <div className="flex items-center gap-4">


          {/* <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 text-sm rounded bg-gray-700 text-white">
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select> */}
        <select 
          value={category} 
          onChange={(e) => {
            const selectedCategoryId = e.target.value;
            console.log("Category selected:", selectedCategoryId);
            setCategory(selectedCategoryId); // Set the category id
            // Find subcategories for the selected category
            const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
            setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
            setSubcategory(""); // Reset subcategory when category changes
          }} 
          className="p-2 text-sm rounded bg-gray-700 text-white"
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select 
          value={subcategory} 
          onChange={(e) => setSubcategory(e.target.value)} 
          className="p-2 text-sm rounded bg-gray-700 text-white"
        >
          <option value="">Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>`


          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm text-gray-400">Group by:</span>
            <button
              onClick={toggleGroupBy}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-cyan-400 border border-cyan-500"
            >
              {groupBy === "category" ? "Category" : "Description"}
            </button>
          </div>
          <button
            // onClick={}
            disabled={selectedTransactions.length === 0}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Check Category Match
          </button>

          <button
            onClick={handleClearCategorized}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Reset Category
          </button>
          
          {/* testing this now so so working*/}
          <button
            onClick={handleCategorizeClick}
            disabled={selectedTransactions.length === 0}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Categorize Transaction
          </button>

        </div>
      </div>

      {/* Filtered and grouped table */}
      {currentTab === "table1" && (
        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-md">
          <table className="min-w-full bg-gray-800">
            <thead className="bg-gray-900 sticky top-0 z-10 text-sm text-left text-gray-300">
              <tr>
                <th className="px-2 py-2 w-[20px] border border-gray-700">
                  {/* <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  /> */}
                </th>
                <th className="px-4 py-2 w-[60px] border border-gray-700">Date</th>
                <th className="px-4 py-2 w-[600px] border border-gray-700">Description</th>
                <th className="px-4 py-2 w-[200px] border border-gray-700">Description2</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Credit</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Debit</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Balance</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Category</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Subcategory</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              {currentItems.map((item, idx) =>
                item.isHeader ? (
                  <tr key={`header-${item.groupKey}`} className="bg-gray-900 border-t border-gray-700">
                    <td colSpan={8} className=" w-[20px] border border-gray-700">
                      <div className="p-3 flex items-center gap-1 truncate">
                        <input
                          type="checkbox"
                          // checked={isGroupFullySelected(item.groupKey)}
                          // onChange={() => handleToggleGroup(item.groupKey)}
                        />
                        {groupBy === "description" && (
                          <span className="text-xs text-blue-400 block">{item.groupKey}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  
                <tr key={startIndex + idx} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(item.uid)}
                      onChange={() => handleCheckboxChange(item.uid)}
                    />
                  </td>
                  <td className="p-3 border border-gray-700 truncate">{item.date1 || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.description || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.description2 || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.credit_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.debit_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.balance_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.category || "-"}</td>
                  <td className={`p-3 border border-gray-700 truncate ${CategoryColor.getCategoryColor(item.category)}`}>
                    {item.subcategory || "-"}
                  </td>
                </tr>

                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-2">
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">
          Page <span className="text-white">{currentPage}</span> of{" "}
          <span className="text-white">{totalPages}</span>
        </span>
        <span className="text-white">{transactions.length}</span>
        <button
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UncategorizedTable;
