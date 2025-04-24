import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";

import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { Loader, LoadClientData, loadCategories, loadSubcategories } from "components/Common";

const CategorizeTables2 = ({ clientId, transactions, selectedTransactions, setSelectedTransactions }) => {
  const [bankName, setBankName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);  // Keep track of selected row indices

  useEffect(() => {
    const loadAll = async () => {
      try {
        //setLoading(true);
        if (clientId) {
          const data = await LoadClientData(clientId);
          if (data?.transactions) {
            setSelectedTransactions([]);
            setBankName(data.bankName);
            console.log(" Bank Name:", data.bankName);
          } else {
            setError("No data found for this client.");
          }
        }
  
        const cats = await loadCategories();
        setCategories(cats);
  
        if (category) {
          const subcats = await loadSubcategories(category);
          setSubcategories(subcats);
        }
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [clientId, setSelectedTransactions, category]);
  


  const columns = [
    { field: "date1", headerName: "Date", width: 150 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "description2", headerName: "Description2", width: 250 },
    { field: "credit_amount", headerName: "Credit", width: 120 },
    { field: "debit_amount", headerName: "Debit", width: 120 },
    { field: "balance_amount", headerName: "Balance", width: 120 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "subcategory", headerName: "Subcategory", width: 150 },
  ];
  const Dropdown = ({ label, value, onChange, items, placeholder }) => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel sx={{ color: 'white' }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={onChange}
        sx={{
          backgroundColor: '#333',
          color: 'white',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
          '&:hover': { backgroundColor: '#444' },
          '&.Mui-focused': { backgroundColor: '#444', borderColor: '#6cace4' },
        }}
      >
        <MenuItem value="">{placeholder}</MenuItem>
        {items.map((item) => (
          <MenuItem key={item.id} value={item.id || item.name}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const handleCategorize = async (clientId, category, subcategory, transaction) => {
    if (!clientId || !category || !subcategory || !transaction) {
      console.log("❌ Missing parameters for categorization");
      console.error("Missing parameters for categorization");
      return;
    }
    const clientRef = doc(db, "clients", clientId);
    const transactionRef = doc(
      db,
      `transaction_database/${bankName}/transactions`,
      transaction.id
    );
    console.log("Transaction Reference:", transactionRef);
    try {
      const clientDoc = await getDoc(clientRef);
      const clientData = clientDoc.data();

      if (!clientData) {
        console.error("Client data not found.");
        return;
      }

      const updatedTransactions = clientData.transactions.map((t) => {
        if (t.id === transaction.id) {
          return {
            ...t,
            category: category,
            subcategory: subcategory,
          };
        }
        return t;
      });

      await updateDoc(clientRef, {
        transactions: updatedTransactions,
      });

      console.log("✅ Transaction categorized successfully.");
    } catch (error) {
      console.error("❌ Error categorizing transaction:", error);
    }
  };

  // selection model change
  // selection model change
  const handleSelectionModelChange = (selection) => {
    console.log("🟡 Selected row indices:", selection);
    setSelectedRows(selection);
    const selected = selection.map((id) => transactions[id]);
    setSelectedTransactions(selected);
    console.log("🟡 Selected transactions:", selected);
  };


  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="flex gap-2 mb-4">
        {/* Category Dropdown */}
        <Dropdown 
          label="Category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          items={categories} 
          placeholder="Category" 
        />

        {/* Subcategory Dropdown */}
        <Dropdown 
          label="Subcategory" 
          value={subcategory} 
          onChange={(e) => setSubcategory(e.target.value)} 
          items={subcategories} 
          placeholder="Subcategory" 
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <button
            onClick={() => {
              console.log("🟢 Categorize clicked");
              selectedTransactions.forEach((t) => {
                console.log("Transaction to categorize:", t); // Logs each transaction
                handleCategorize(clientId, category, subcategory, t);
              });
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs rounded"
          >
            📂 Categorize
          </button>
            <button
              onClick={() => {
                console.log("🛑 Clear selected transactions");
                setSelectedTransactions([]);
              }}
              className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs rounded"
            >
              ❌ Clear
          </button>
        </Box>
      </div>
  
      {/* Data Grid */}
      <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={transactions.map((t, index) => {
          //console.log("Row:", { id: index, ...t }); // Add console.log here to confirm rows
          return { id: index, ...t };
        })}
        columns={columns}
        checkboxSelection
        onSelectionModelChange={handleSelectionModelChange}
      />

      </div>
    </>
  );
};
export default CategorizeTables2;
