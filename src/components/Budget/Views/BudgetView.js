import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Stack, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
} from "@mui/material";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

import { 
  LoadClientData,
  loadCategories, 
} from "components/Common";

export default function BudgetView({ clientId }) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ✅ helper to round UP to 2 decimals
  const ceil2 = (num) => Math.ceil(num * 100) / 100;

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

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      const enriched = cats.map(cat => ({
        ...cat,
        key: cat.name === "Income" ? "credit_amount" : "debit_amount",
        filter: (t) => t.category === cat.name
      }));
      setCategories(enriched);
    };
    fetchCats();
  }, []);

  const calculateBudget = async () => {
    setLoading(true);
    setMessage("");

    const budgetTransactions = {};

    categories.forEach(({ name, filter, key }) => {
      const txns = transactions.filter(filter);
      const total = txns.reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);
      const monthSet = new Set(txns.map(t => moment(t.date1, ["DD/MM/YYYY"]).format("MMM")));
      const avg = monthSet.size > 0 ? total / monthSet.size : 0;

      budgetTransactions[name] = {
        total: ceil2(total),
        avg: ceil2(avg)
      };
    });

    try {
      const ref = doc(db, "clients", clientId);
      await updateDoc(ref, {
        budgetTransactions,
        timestamp: new Date().toISOString()
      });

      setMessage("✅ Budget calculated & saved successfully!");
      setHasCalculated(true);
    } catch (err) {
      console.error("🔥 Error saving budget:", err);
      setMessage("❌ Failed to save budget.");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            onClick={calculateBudget}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate & Save Budget"}
          </Button>
          <Typography
            variant="caption"
            color={hasCalculated ? "success.main" : "warning.main"}
            sx={{ fontStyle: "italic" }}
          >
            {hasCalculated ? message : "Don't forget to click to calculate!"}
          </Typography>
        </Stack>

        {categories.map(({ name, filter, key }) => {
          const rows = transactions.filter(filter).reduce((acc, t) => {
            const m = moment(t.date1, ["DD/MM/YYYY"]).format("MMM");
            const sub = t.subcategory || "Uncategorized";
            if (!acc[sub]) acc[sub] = { total: 0 };
            if (!acc[sub][m]) acc[sub][m] = 0;
            acc[sub][m] += parseFloat(t[key]) || 0;
            acc[sub].total += parseFloat(t[key]) || 0;
            return acc;
          }, {});

          const monthTotals = months.reduce((acc, m) => {
            acc[m] = Object.values(rows).reduce((s, r) => s + (r[m] || 0), 0);
            return acc;
          }, {});

          const grandTotalRaw = Object.values(monthTotals).reduce((s, v) => s + v, 0);
          const grandTotal = ceil2(grandTotalRaw);
          const validMonths = Object.values(monthTotals).filter(v => v !== 0);
          const grandAvg = validMonths.length ? ceil2(grandTotalRaw / validMonths.length) : 0;

          return (
            <Box key={name}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {name} (Total: R {grandTotal.toFixed(2)} | Avg: R {grandAvg.toFixed(2)})
              </Typography>
              <Box sx={{ overflowX: "auto", mt: 2 }}>
                <Table size="small" sx={{ minWidth: 650, border: "1px solid #ccc" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Subcategory</b></TableCell>
                      {months.map(m => (
                        <TableCell key={m} align="center"><b>{m}</b></TableCell>
                      ))}
                      <TableCell align="right"><b>Total</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(rows).map(([sub, mdata]) => (
                      <TableRow key={sub}>
                        <TableCell sx={{ fontWeight: 600 }}>{sub}</TableCell>
                        {months.map(m => (
                          <TableCell key={m} align="right">
                            {mdata[m] ? `R ${ceil2(mdata[m]).toFixed(2)}` : "-"}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          R {ceil2(mdata.total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>TOTAL</TableCell>
                      {months.map(m => (
                        <TableCell key={m} align="right">
                          {monthTotals[m] ? `R ${ceil2(monthTotals[m]).toFixed(2)}` : "-"}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        R {grandTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>AVERAGE</TableCell>
                      {months.map(m => (
                        <TableCell key={m} align="right">
                          {monthTotals[m]
                            ? `R ${ceil2(monthTotals[m] / validMonths.length).toFixed(2)}`
                            : "-"}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        R {grandAvg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
