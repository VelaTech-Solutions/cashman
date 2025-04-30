import React, { useState, useEffect } from "react";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { LoadClientData, loadCategories, loadSubcategories } from "components/Common";

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
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


const UncategorizedTable = ({ clientId }) => {
  const [clientData, setClientData] = useState({});
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [transactions, setTransactions] = useState([]);
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

  const handleSelectionModelChange = (selectionModel) => {
    console.log("Selection model changed:", selectionModel);  // Log the selection model
    const selected = transactions.filter((t) => selectionModel.includes(t.uid));
    setSelectedTransactions(selected);
    console.log("Selected transactions:", selected);  // Log the selected transactions
  };

  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex gap-2 mb-4">
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <Dropdown
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
          />

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
              selectionModel.forEach((id) => {
                const transaction = transactions.find((t) => t.uid === id);
                if (transaction) {
                  handleCategorize(clientId, category, subcategory, transaction);
                }
              });
            }}
            startIcon={<span>📂</span>}
          >
            Categorize
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setSelectedTransactions([])}
            startIcon={<span>❌</span>}
          >
            Clear
          </Button>
        </Box>
      </div>

      <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={transactions.map((t) => ({ id: t.uid, ...t }))}
        columns={columns}
        checkboxSelection
        selectionModel={selectionModel}
        onRowSelectionModelChange={(newSelection) => {
          setSelectionModel(newSelection);
          console.log("New selection model:", newSelection); // Log the new selection
        }}
      />
      </div>
    </ThemeProvider>
  );
};

export default UncategorizedTable;

