import React, { useState,useEffect } from "react";
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { LoadClientData, loadCategories, loadSubcategories } from "components/Common";
export default function SummaryView({ clientId }) {
  const [categoryRange, setCategoryRange] = useState({});
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  // the eg const [otherSetting, setOtherSetting] = useState(null); // add as needed
  const [categories, setCategories] = useState([]);

  // Load categories and subcategories
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
        setBudgetTransactions(clientData.budgetTransactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);
  const configDoc = (docName) =>
    doc(db, "settings", "budget", "config", docName);

  useEffect(() => {
    const fetchConfigs = async () => {
      const rangeSnap = await getDoc(configDoc("RangeSettings"));
      if (rangeSnap.exists()) {
        const data = rangeSnap.data();
        setCategoryRange(data.categoryRange || {});
      }

      // the eg
      // const otherSnap = await getDoc(configDoc("OtherSettings"));
      // if (otherSnap.exists()) {
      //   setOtherSetting(otherSnap.data());
      // }

      // repeat as needed for more
    };

    fetchConfigs();
  }, []);

  const parseAmount = (val) => (!isNaN(val) ? parseFloat(val) : 0);
  const parsedIncome = parseAmount(budgetTransactions?.Income?.avg || 0);

  const budgetRows = Object.entries(budgetTransactions)
    .filter(([key]) => key !== "Income") // exclude Income
    .map(([category, data]) => {
      const rangeEntry = categoryRange.find(c => c.category === category);
      const range = parseFloat(rangeEntry?.range || 0);
      const allowedAmount = parsedIncome * (range / 100);
      const actual = parseAmount(data.avg);
      const yourRange = parsedIncome > 0 ? ((actual / parsedIncome) * 100).toFixed(2) : "0.00";
      const isOut = actual > allowedAmount;
      return {
        category,
        range,
        allowedAmount,
        actual,
        yourRange,
        isOut,
      };
    });

  const parsedCategories = Object.fromEntries(
    Object.entries(budgetTransactions).map(([key, val]) => [
      key,
      parseAmount(val.avg),
    ])
  );

  const income = parsedCategories["Income"] || 0;

  const deductions = Object.entries(parsedCategories)
    .filter(([key]) => key !== "Income")
    .map(([name, amount]) => ({ name, amount }));

  const disposableIncome = income - deductions.reduce((sum, d) => sum + d.amount, 0);


  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <TableContainer component={Paper}>
          <MuiTable size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Normal Range</TableCell>
                <TableCell>Allowed Spending</TableCell>
                <TableCell>Your %</TableCell>
                <TableCell>Actual Spending</TableCell>
                <TableCell>In/Out of Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.range}%</TableCell>
                  <TableCell>R {row.allowedAmount.toFixed(2)}</TableCell>
                  <TableCell>{row.yourRange}%</TableCell>
                  <TableCell>R {row.actual.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: row.isOut ? 'error.main' : 'success.main' }}>
                    {row.isOut ? 'No' : 'Yes'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <Box>
          <Stack spacing={0.5}>
            <Paper sx={{ bgcolor: "grey.800", p: 2, display: "flex", justifyContent: "space-between", borderRadius: 2 }}>
              <Typography>Income</Typography>
              <Typography fontWeight={600} color="success.light">
                R {income.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
              {deductions.map((item, i) => (
                <Paper
                  key={i}
                  sx={{
                    bgcolor: "grey.800",
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Typography>{item.name}</Typography>
                  <Typography fontWeight={600} color="error.light">
                    R {item.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </Typography>
                </Paper>
              ))}
          </Stack>
        </Box>
        <Box>
          <Paper
            sx={{
              bgcolor: "grey.800",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              borderRadius: 2,
            }}
          >
            <Typography>Remaining Balance</Typography>
            <Typography
              fontWeight={600}
              color={disposableIncome >= 0 ? "success.light" : "error.light"}
            >
              R {disposableIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};