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
const BudgetViewByMonth = ({ clientId }) => {

    const [clientData, setClientData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [error, setError] = useState(null);

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


// in the array of transactions i have field id that you can you for mui
// Initialize global accumulators
let totalIncome = 0;
let totalExpense = 0;
let totalTransactionCount = 0;

const categoryIncomeTotals = {};
const categoryExpenseTotals = {};
const categoryIncomeCounts = {};
const categoryExpenseCounts = {};
const categoryTotalCounts = {};

const subcategoryIncomeTotals = {};
const subcategoryExpenseTotals = {};
const subcategoryIncomeCounts = {};
const subcategoryExpenseCounts = {};
const subcategoryTotalCounts = {};

// Monthly aggregation example
const monthlyAggregates = {};

// Process transactions
transactions.forEach(txn => {
  if (!txn.date1) return; // skip if no date

  const [day, monthStr, year] = txn.date1.split("/");
  const month = Number(monthStr);
  const monthKey = `${months[month - 1]} ${year}`;

  // Initialize monthly data if needed
  if (!monthlyAggregates[monthKey]) {
    monthlyAggregates[monthKey] = { credit: 0, debit: 0, days: new Set(), count: 0 };
  }

  const credit = Number(txn.credit_amount) || 0;
  const debit = Number(txn.debit_amount) || 0;

  totalIncome += credit;
  totalExpense += debit;
  totalTransactionCount++;

  // Monthly aggregate update
  monthlyAggregates[monthKey].credit += credit;
  monthlyAggregates[monthKey].debit += debit;
  monthlyAggregates[monthKey].days.add(txn.date1);
  monthlyAggregates[monthKey].count++;

  // Category aggregations
  const cat = txn.category || "Uncategorized";
  if (credit > 0) {
    categoryIncomeTotals[cat] = (categoryIncomeTotals[cat] || 0) + credit;
    categoryIncomeCounts[cat] = (categoryIncomeCounts[cat] || 0) + 1;
  }
  if (debit > 0) {
    categoryExpenseTotals[cat] = (categoryExpenseTotals[cat] || 0) + debit;
    categoryExpenseCounts[cat] = (categoryExpenseCounts[cat] || 0) + 1;
  }
  categoryTotalCounts[cat] = (categoryTotalCounts[cat] || 0) + 1;

  // Subcategory aggregations
  const subcat = txn.subcategory || "Uncategorized";
  if (credit > 0) {
    subcategoryIncomeTotals[subcat] = (subcategoryIncomeTotals[subcat] || 0) + credit;
    subcategoryIncomeCounts[subcat] = (subcategoryIncomeCounts[subcat] || 0) + 1;
  }
  if (debit > 0) {
    subcategoryExpenseTotals[subcat] = (subcategoryExpenseTotals[subcat] || 0) + debit;
    subcategoryExpenseCounts[subcat] = (subcategoryExpenseCounts[subcat] || 0) + 1;
  }
  subcategoryTotalCounts[subcat] = (subcategoryTotalCounts[subcat] || 0) + 1;
});

// Calculate averages by category
const categoryIncomeAverages = {};
const categoryExpenseAverages = {};
for (const cat in categoryTotalCounts) {
  categoryIncomeAverages[cat] = (categoryIncomeTotals[cat] || 0) / (categoryIncomeCounts[cat] || 1);
  categoryExpenseAverages[cat] = (categoryExpenseTotals[cat] || 0) / (categoryExpenseCounts[cat] || 1);
}

// Calculate averages by subcategory
const subcategoryIncomeAverages = {};
const subcategoryExpenseAverages = {};
for (const subcat in subcategoryTotalCounts) {
  subcategoryIncomeAverages[subcat] = (subcategoryIncomeTotals[subcat] || 0) / (subcategoryIncomeCounts[subcat] || 1);
  subcategoryExpenseAverages[subcat] = (subcategoryExpenseTotals[subcat] || 0) / (subcategoryExpenseCounts[subcat] || 1);
}

// Monthly averages calculation example (avg per day)
const monthlyAverages = {};
for (const monthKey in monthlyAggregates) {
  const { credit, debit, days, count } = monthlyAggregates[monthKey];
  monthlyAverages[monthKey] = {
    avgCreditPerDay: credit / days.size,
    avgDebitPerDay: debit / days.size,
    transactionCount: count,
  };
}

console.log({ totalIncome, totalExpense, totalTransactionCount });
console.log({ categoryIncomeTotals, categoryExpenseTotals, categoryIncomeAverages, categoryExpenseAverages });
console.log({ subcategoryIncomeTotals, subcategoryExpenseTotals, subcategoryIncomeAverages, subcategoryExpenseAverages });
console.log("last",{ monthlyAggregates, monthlyAverages });



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

            {/* First Tree The months  */}

      {/* Tree 2 cat */}

      {/* Tree 3 Subcat */}

      {/* tree 4 the transactions then self */}

<SimpleTreeView>
  {Object.entries(monthlyAggregates).map(([monthKey, { credit, debit }]) => (
    <TreeItem
      key={monthKey}
      id={monthKey}
      nodeId={monthKey}
      label={`${monthKey} (In: ${credit.toFixed(2)}, Out: ${debit.toFixed(2)})`}
    />
  ))}
</SimpleTreeView>




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

    </Box>
  );
};

export default BudgetViewByMonth;
