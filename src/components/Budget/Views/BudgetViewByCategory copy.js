import React, { useState,useEffect } from "react";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// uuid import
import { v4 as uuidv4 } from "uuid";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import { Grid, Box, CircularProgress,TextField, InputAdornment, Typography } from "@mui/material";
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';


import { 
  LoadClientData,
  loadCategories, 
  LoadSubcategories,
 } from "components/Common";
const BudgetView = ({ clientId }) => {

  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  // Load categories subcategories
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      const enriched = cats.map(cat => {
        const key = cat.name === "Income" ? "credit_amount" : "debit_amount";
        const total = transactions
          .filter(t => t.category === cat.name)
          .reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);

        return {
          ...cat,
          key,
          total,
          filter: (t) => t.category === cat.name,
        };
      });
      setCategories(enriched);
    };

    fetchCats();
  }, [transactions]); // <-- Add transactions as a dependency to recalculate totals

  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!category) return;
      const subs = await loadSubcategories(category);
      setSubcategories(subs);
    };
    fetchSubs();
  }, [category]);


  const calculateBudget = async () => {
    let totals = {}, avgs = {};
    categories.forEach(({ name, filter, key }) => {
      const txns = transactions.filter(filter);
      const total = txns.reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);
      const monthSet = new Set(txns.map(t => moment(t.date1, ["DD/MM/YYYY"]).format("MMM")));
      const avg = monthSet.size > 0 ? total / monthSet.size : 0;
      totals[name.toLowerCase()] = parseFloat(total.toFixed(2));
      avgs[`${name.toLowerCase()}avg`] = parseFloat(avg.toFixed(2));
    });

    try {
      const ref = doc(db, "clients", clientId);
      await updateDoc(ref, { budgetData: { ...totals, ...avgs, timestamp: new Date().toISOString() } });
    } catch (err) {
      console.error("🔥 Error saving budget:", err);
    }
  };




  const processedCategories = categories.map(cat => {
    const key = cat.name === "Income" ? "credit_amount" : "debit_amount";

    const subsWithTotals = (cat.subcategories || [])
      .map(sub => {
        const total = transactions
          .filter(t => t.category === cat.name && t.subcategory === sub.name)
          .reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);
        return total > 0 ? { ...sub, total } : null;
      })
      .filter(Boolean);

    const total = subsWithTotals.reduce((sum, s) => sum + s.total, 0);
    const avg = subsWithTotals.length ? total / subsWithTotals.length : 0;

    return { ...cat, subsWithTotals, total, avg };
  });

  const CategoryTreeSx = {
    border: '4px solid',
    borderRadius: 1,
    mb: 4,
    //backgroundColor: "#424242",
    color: 'white',
  };

  const SubcategoryTreeSx = {
    border: '1px solid',
    borderRadius: 1,
    //backgroundColor: "#424242",
    color: 'white',
  };

  const TotalsAvgTreeSx ={
    borderTop: '4px solid',
    
  };

  return (

    
    <Box sx={{ minHeight: 352, minWidth: 250 }}>

{/* button to save the calculations calculateBudget */}

      <Button onClick={calculateBudget}>Save Calculations</Button>


      <SimpleTreeView>
        {processedCategories.map((cat, i) => (
          
          <TreeItem
            key={`cat-${i}`}
            itemId={`cat-${i}`}
            label={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.white' }}>
                  {cat.name} ({transactions.filter(t => t.category === cat.name).length} Transactions)
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 14, color: 'text.white' }}>
                    Total: {cat.total.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: 'text.white' }}>
                    Avg: {cat.avg.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            }
            sx={CategoryTreeSx}
          >
            {cat.subsWithTotals.map((sub, j) => (
              <TreeItem
                key={`subcat-${i}-${j}`}
                itemId={`subcat-${i}-${j}`}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1 }}>
                    <Typography sx={{ color: 'text.white' }}>{sub.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.white' }}>
                      {sub.total.toFixed(2)}
                    </Typography>
                  </Box>
                }
                sx={SubcategoryTreeSx}
              />
            ))}
            <TreeItem
              key={`total-${i}`}
              itemId={`total-${i}`}
              label={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1 }}>
                  <Typography sx={{ fontStyle: 'italic', color: 'red' }}>
                    Total
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: 'text.white' }}>
                    {cat.total.toFixed(2)}
                  </Typography>
                </Box>
              }
              sx={TotalsAvgTreeSx}
            />
            <TreeItem
              key={`avg-${i}`}
              itemId={`avg-${i}`}
              label={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1 }}>
                  <Typography sx={{ fontStyle: 'italic', color: 'red' }}>
                    Average
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: 'text.white' }}>
                    {cat.avg.toFixed(2)}
                  </Typography>
                </Box>
              }
              sx={TotalsAvgTreeSx}
            />
          </TreeItem>
        ))}
      </SimpleTreeView>
    </Box>

  );
};

export default BudgetView;
