import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { LoadClientData, loadCategories, loadSubcategories } from "components/Common";

// MUI Imports
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button } from "@mui/material";


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


const CategorizedTable = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bankName, setBankName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState(null);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
          try {
          const clientData = await LoadClientData(clientId);
          setClientData(clientData);
          setBankName(clientData.bankName || "Unknown");
          setTransactions(clientData.transactions || []);

          } catch (err) {
          console.error("Error fetching data:", err.message);
          setError("Failed to fetch Client Data.");
          }
      };
  
      fetchData();
      }, [clientId]);

      console.log("Transactions", transactions)

  useEffect(() => {
    const loadCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    loadCats();
  }, []);

  useEffect(() => {
    const loadSubcats = async () => {
      if (category) {
        const subs = await loadSubcategories(category);
        setSubcategories(subs);
      } else {
        setSubcategories([]);
      }
    };
    loadSubcats();
  }, [category]);

  

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
          <MenuItem key={item.id} value={item.id}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const handleCategorize = async (clientId, category, subcategory, transaction) => {
    if (!clientId || !category || !subcategory || !transaction?.uid) {
      console.error("Missing parameters for categorization");
      return;
    }
    console.log("Categorizing transaction:", transaction);
    try {
      const clientRef = doc(db, "clients", clientId);
      const clientDoc = await getDoc(clientRef);
      const clientData = clientDoc.data();

      if (!clientData?.transactions) {
        console.error("No transactions found for client.");
        return;
      }

      const updatedTransactions = clientData.transactions.map((t) => {
        if (t.uid === transaction.uid) {
          return { ...t, category, subcategory };
        }
        return t;
      });

      await updateDoc(clientRef, { transactions: updatedTransactions });
      console.log(`✅ Transaction [UID: ${transaction.uid}] categorized.`);
    } catch (error) {
      console.error("❌ Error categorizing transaction:", error);
    }
  };

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



  const handleSelectionModelChange = (selection) => {
    const selected = transactions.filter((t) => selection.includes(t.uid));
    setSelectedTransactions(selected);
    console.log("🟡 Selected transactions:", selected);
  };

  // Filter transactions based on category and subcategory but only display the trasactions that are categorized
  const categorizedTransactions = transactions.filter(
    (t) => t.category && t.subcategory
  );
  
  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex gap-2 mb-4">
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          {/* <Dropdown
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            items={categories}
            placeholder="Category"
          />
          <Dropdown
            label="Subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            items={subcategories}
            placeholder="Subcategory"
          /> */}
{/* 
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => {
              // Match All action
            }}
            startIcon={<span>📂</span>}
          >
            Match All
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              selectedTransactions.forEach((t) => {
                handleCategorize(clientId, category, subcategory, t);
              });
            }}
            startIcon={<span>📂</span>}
          >
            Categorize
          </Button> */}
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleClearCategorized([])}
            startIcon={<span>❌</span>}
          >
            Clear
          </Button>
        </Box>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={categorizedTransactions.map((t) => ({ id: t.uid, ...t }))}
          columns={columns}
          checkboxSelection
          onSelectionModelChange={handleSelectionModelChange}
        />
      </div>
    </ThemeProvider>
  );
};

export default CategorizedTable;
