
import React, { useState, useEffect } from "react";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { 
  LoadClientData,
  loadCategories, 
  loadSubcategories,
 } from "components/Common";

import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Container,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { Select, MenuItem, InputLabel, FormControl, LinearProgress, Button, } from '@mui/material';

const PersonalBudgetView7 = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

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

  // Load categories once on mount
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!category) return;
      const subs = await loadSubcategories(category);
      setSubcategories(subs);
    };
    fetchSubs();
  }, [category]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

 // Group transactions by month
 const groupTransactionsByMonth = (transactions) => {
  return transactions.reduce((groups, tx) => {
    const month = moment(tx.date1, "DD/MM/YYYY").format("DD/MM/YYYY"); 
    if (!groups[month]) groups[month] = [];
    groups[month].push(tx);
    return groups;
  }, {});
};

// Sum amounts for each subcategory per month
const sumSubcategoryAmounts = (transactions) => {
  return transactions.reduce((sums, tx) => {
    const subcategory = tx.subcategory || "Uncategorized";
    const amount = parseFloat(tx.debit_amount || 0) - parseFloat(tx.credit_amount || 0);
    if (!sums[subcategory]) sums[subcategory] = 0;
    sums[subcategory] += amount;
    return sums;
  }, {});
};

// Group transactions by both month and subcategory, then sum the amounts
const groupTransactionsByMonthAndSubcategory = (transactions) => {
  return transactions.reduce((groups, tx) => {
    const month = moment(tx.date1, "DD/MM/YYYY").format("DD/MM/YYYY");
    const subcategory = tx.subcategory || "Uncategorized";
    const amount = parseFloat(tx.debit_amount || 0) - parseFloat(tx.credit_amount || 0);

    if (!groups[month]) groups[month] = {};  // If month doesn't exist, create it
    if (!groups[month][subcategory]) groups[month][subcategory] = 0;  // If subcategory doesn't exist, create it

    groups[month][subcategory] += amount;
    return groups;
  }, {});
};

const monthlySumsBySubcat = {};

transactions.forEach(tx => {
  const catName = tx.category || "Uncategorized";
  const subcat = tx.subcategory || "Uncategorized";
  const amount = parseFloat(tx.debit_amount || 0) - parseFloat(tx.credit_amount || 0);
  const month = moment(tx.date1, "DD/MM/YYYY").format("MMM");

  if (!monthlySumsBySubcat[catName]) monthlySumsBySubcat[catName] = {};
  if (!monthlySumsBySubcat[catName][subcat]) monthlySumsBySubcat[catName][subcat] = {};
  if (!monthlySumsBySubcat[catName][subcat][month]) monthlySumsBySubcat[catName][subcat][month] = 0;

  monthlySumsBySubcat[catName][subcat][month] += amount;
});


return (
  <div>
    {categories.map((cat) => {
      const filteredTransactions = transactions.filter(tx => tx.category === cat.name);
      const groupedTransactions = groupTransactionsByMonthAndSubcategory(filteredTransactions);

      return (
        <Box
          key={cat.id}
          sx={{
            mt: 4,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            // text black
            color: 'black'
          }}
        >
          <Typography variant="h6">{cat.name}</Typography>

          {/* Table displaying months as column headers */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subcategory</TableCell>
                  {months.map((month) => (
                    <TableCell key={month} align="center">
                      {month}
                    </TableCell>
                  ))}
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {Object.entries(monthlySumsBySubcat[cat.name] || {}).map(([subcat, monthData]) => (
    <TableRow key={subcat}>
      <TableCell>{subcat}</TableCell>
      {months.map(month => (
        <TableCell key={month} align="center">
          {monthData[month] ? monthData[month].toFixed(2) : "-"}
        </TableCell>
      ))}
      <TableCell align="center">
        {Object.values(monthData).reduce((sum, val) => sum + val, 0).toFixed(2)}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    })}
  </div>
);


};
export default PersonalBudgetView7;