import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Box, CircularProgress, Stack } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {
  DataGrid
} from '@mui/x-data-grid';
import { handleDeleteClient } from "components/Client/ClientDelete";

import { hardResetClientDb } from "components/Transactions/ExtractTransactions/ExtractAutomatic/Utils";

const getCategorizedColor = (categorized) => {
  const percentage = Math.min(Math.max(categorized, 0), 100); // Ensure it's between 0% and 100%
  const red = Math.floor((100 - percentage) * 2.55);  // Red decreases as the percentage increases
  const green = Math.floor(percentage * 2.55);  // Green increases as the percentage increases
  return `rgb(${red}, ${green}, 0)`; // Creates a gradient from red to green
};



const Table = ({ sortedClients, setSelectedClientId, setActivePage }) => {


  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setClients(sortedClients);
  }, [sortedClients]);


  const searchQueryClients = clients.filter((client) => {
    const clientName = client.clientName?.toLowerCase() || "";
    const clientid = client.idNumber?.toLowerCase() || "";
    return clientName.includes(searchQuery.toLowerCase()) || clientid.includes(searchQuery.toLowerCase());
  });

  const rows = searchQueryClients.map((client, index) => ({
    id: client.id,// set the length just for this?
    clientName: client.clientName,
    clientSurname: client.clientSurname,
    bankName: client.bankName,
    status: client.status,
    categorized: client.categorized != null ? client.categorized : 0, // store as a number
    number_of_transactions: client.number_of_transactions,
    dateCreated: client.dateCreated ? client.dateCreated.toDate().toLocaleDateString("en-GB") : "",
    userEmail: client.userEmail,
    bankType: client.bankType,
  }));

  const columns = [
    { field: "id", headerName: "Client ID", width: 140 },
    { field: "clientName", headerName: "Name", flex: 1 },
    { field: "clientSurname", headerName: "Surname", flex: 1 },
    { field: "bankName", headerName: "Bank Name", flex: 1 },
    { field: "status", headerName: "Status %", flex: 1 },
    {
      field: "categorized",
      headerName: "Categorized %",
      flex: 1,
      renderCell: (params) => {
        const percentage = params.value || 0;
        const color = getCategorizedColor(percentage);
    
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', height: '100%' }}>
          <Typography sx={{ color: color }}>
            {`${percentage} %`}
          </Typography>
        </Box>
        );
        
      },
    },
    { field: "number_of_transactions", headerName: "Transactions", flex: 1 },
    { field: "dateCreated", headerName: "Date Created", flex: 1 },
    { field: "userEmail", headerName: "Created By", flex: 1 },
    // Action Button
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
      <Button
        variant="text"
        color="primary"
        onClick={() => {
          setSelectedClientId(params.row.id);
          setActivePage("ClientProfile");
        }}
      >
        View
      </Button>

      ),
    },
    // Delete Button
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="text"
          color="error"  
          onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this client?")
              ) {
                handleDeleteClient(params.row.id).then(() => {
                  setClients((prev) =>
                    prev.filter((c) => c.id !== params.row.id)
                  );
                });
              }
            }}
          >
          Delete
        </Button>
      )
    },
    // bank type
    {
      field: "bankType", headerName: "Type", flex: 1 
    },
    // hard Reset
    {
      field: "hardReset",
      headerName: "Hard Reset",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          onClick={async () => {
            const confirmed = window.confirm("⚠️ Are you sure you want to hard reset this client?");
            if (!confirmed) return;

            try {
              await hardResetClientDb(params.row.id);
              alert("✅ Hard reset successful");
            } catch (err) {
              console.error("❌ Hard reset failed", err);
              alert("❌ Hard reset failed");
            }
          }}
        >
          Hard Reset
        </Button>
      )
    },


  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            value={searchQuery}
            fullWidth
            variant="outlined"
            label="Search by ID or Name"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        <Box>
          {loading ? (
              <CircularProgress />
          ) : rows.length === 0 ? (
            <CircularProgress />
          ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                sx={{
                  height: 690,
                  width: '100%'
                }}
              />
            )}  
        </Box>
      </Stack>
    </Box>
  );
};

export default Table;
