import React, { useState,useEffect } from "react";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// uuid import
import { v4 as uuidv4 } from "uuid";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import { Grid, Box, CircularProgress,TextField, InputAdornment, Typography, Divider } from "@mui/material";
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
 } from "components/Common";



function calculateBudgetData(categories, transactions) {
  let totals = {}, avgs = {};
  categories.forEach(({ name, filter, key }) => {
    const txns = transactions.filter(filter);
    const total = txns.reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);
    const monthSet = new Set(txns.map(t => {
      // Format date1 to month abbreviation, fallback to empty string if invalid
      const d = t.date1;
      if (!d) return "";
      try {
        return new Date(d.split('/').reverse().join('-')).toLocaleString('default', { month: 'short' });
      } catch {
        return "";
      }
    }).filter(m => m));
    const avg = monthSet.size > 0 ? total / monthSet.size : 0;
    totals[name.toLowerCase()] = parseFloat(total.toFixed(2));
    avgs[`${name.toLowerCase()}avg`] = parseFloat(avg.toFixed(2));
  });
  return { totals, avgs };
}



const BudgetViewByMonth = ({ clientId }) => {

    const [clientData, setClientData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [error, setError] = useState(null);
const { totals, avgs } = calculateBudgetData(categories, transactions);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        // can we seperate it here?
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
    }, [transactions]);
    
  
const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];


  const monthsSx ={
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

  const CategoryTreeSx = {
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

      {/* for debugging */}
      <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{}}>Debug: Credit/Debit Totals and Daily Averages by Month</Typography>
      {Object.entries(
          transactions
            .filter(txn => txn.category)
            .reduce((acc, txn) => {
              const date = txn.date1;
              if (date) {
                const [day, month, year] = date.split("/");
                const key = `${month}/${year}`;
                acc[key] = acc[key] || { credit: 0, debit: 0, days: new Set(), count: 0 };
                acc[key].credit += Number(txn.credit_amount || 0);
                acc[key].debit += Number(txn.debit_amount || 0);
                acc[key].days.add(date);
                acc[key].count += 1;
              }
              return acc;
            }, {})
        ).map(([month, { credit, debit, days, count }]) => {
          const numDays = days.size;
          return (
            <Box key={month} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{month}</Typography>
              <Typography>Transactions: {count}</Typography>
              <Typography>Total In (Credit): {credit.toFixed(2)}</Typography>
              <Typography>Total Out (Debit): {debit.toFixed(2)}</Typography>
              <Typography>Avg In/Day: {(credit / numDays).toFixed(2)}</Typography>
              <Typography>Avg Out/Day: {(debit / numDays).toFixed(2)}</Typography>
              <Divider sx={{ mt:2, borderColor:'white'}} />
            </Box>
          );
        })}
      </Box>


      {/* debug 2 */}

      <Box sx={{mt:2}}>
            <div>
      {/* now you can display totals and avgs here or use them as needed */}
      <pre>{JSON.stringify(totals, null, 2)}</pre>
      <pre>{JSON.stringify(avgs, null, 2)}</pre>

      {/* rest of your UI */}
    </div>
      </Box>

    </Box>
  );
};

export default BudgetViewByMonth;
