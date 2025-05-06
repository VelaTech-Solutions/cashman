// src/pages/ViewTransactions.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase imports
import { db } from "../../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

import {
  Box,
  Typography,
  TextField,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";


// Component Imports
import { Sidebar, LoadClientData, Table } from 'components/Common';
import OverViews from "../ViewTransactions/OverViews/OverView";


const ViewTransactions = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically generate links with the `clientId`
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: `/client/${clientId}/transactionspage`, label: "Back to Tansactions", icon: "ph-file-text" },
    { path: `/client/${clientId}`, label: "Back to Profile", icon: "ph-file-text" },
    { type: "divider" },
    {
      path: `/viewSettings/${clientId}`,
      label: "View Settings",
      icon: "ph-arrow-left",
    },
    { 
      path: "/HelpView", 
      label: "View Help", 
      icon: "ph-arrow-left" 
    },
  ];

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
          try {
          const clientData = await LoadClientData(clientId);
          setClientData(clientData);
          setTransactions(clientData);
          } catch (err) {
          console.error("Error fetching data:", err.message);
          setError("Failed to fetch Client Data.");
          }
      };
  
      fetchData();
      }, [clientId]);

  // Filter transactions based on search query
  const filteredTransactions = clientData?.transactions?.filter(
    (transaction) => {
      return (
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.date1?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="View Transactions" links={links} />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">View Transactions</h2>
        <div className="flex justify-start items-center space-x-4 mb-4">
          <OverViews transactions={clientData?.transactions || []} />
        </div>
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          label="Search by date or description"
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ input: { color: "white" }, label: { color: "#ccc" }, mb: 4 }}
        />

        <Paper sx={{ bgcolor: "#1e1e1e", p: 2 }}>
          {filteredTransactions?.length > 0 ? (
            <TableContainer sx={{ maxHeight: 500 }}>
              <MuiTable stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Date1", "Date2", "Description", "Description +", "Fee Type",
                    "Fee Amount", "Credit/Debit", "Credit Amount", "Debit Amount", "Balance Amount"
                  ].map((header, i, arr) => (
                    <TableCell
                      key={i}
                      sx={{
                        color: "black",
                        borderBottom: "1px solid #444",
                        borderRight: i < arr.length - 1 ? "1px solid #444" : "none"
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((txn, index) => (
                  <TableRow key={index}>
                    {[
                      txn.date1, txn.date2, txn.description, txn.description2,
                      txn.fee_type, txn.fee_amount, txn.credit_debit_amount,
                      txn.credit_amount, txn.debit_amount, txn.balance_amount
                    ].map((value, i, arr) => (
                      <TableCell
                        key={i}
                        sx={{
                          color: "white",
                          borderRight: i < arr.length - 1 ? "1px solid #444" : "none"
                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              </MuiTable>
            </TableContainer>
          ) : (
            <Typography sx={{ textAlign: "center", py: 3, color: "#aaa" }}>
              No transactions found.
            </Typography>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ViewTransactions;
