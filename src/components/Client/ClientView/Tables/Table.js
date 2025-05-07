import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Button, Box } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import CancelIcon from '@mui/icons-material/Cancel';
import InputAdornment from '@mui/material/InputAdornment';
import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from '@mui/x-data-grid';
import { handleDeleteClient } from "components/Client/ClientDelete";

const StyledToolbarButton = styled(ToolbarButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
}));

const StyledQuickFilter = styled(QuickFilter)(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  flexGrow: 1,
  width: 'auto',
}));

const StyledTextField = styled('input')(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #ccc',
}));

const CustomToolbar = () => (
  <Toolbar>  
    <Tooltip title="Columns">
      <StyledToolbarButton>
        <ViewColumnIcon fontSize="small" />
      </StyledToolbarButton>
    </Tooltip>

    <Tooltip title="Filter">
      <StyledToolbarButton>
        <FilterListIcon fontSize="small" />
      </StyledToolbarButton>
    </Tooltip>

    <QuickFilter>
      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </QuickFilter>
    
  </Toolbar>
);

const getCategorizedColor = (categorized) => {
  const percentage = Math.min(Math.max(categorized, 0), 100); // Ensure it's between 0% and 100%
  const red = Math.floor((100 - percentage) * 2.55);  // Red decreases as the percentage increases
  const green = Math.floor(percentage * 2.55);  // Green increases as the percentage increases
  return `rgb(${red}, ${green}, 0)`; // Creates a gradient from red to green
};



const Table = ({ sortedClients }) => {

  const [clients, setClients] = useState([]);

  useEffect(() => {
    setClients(sortedClients);
  }, [sortedClients]);

  const rows = clients.map((client, index) => ({
    id: client.id,// set the length just for this?
    clientName: client.clientName,
    clientSurname: client.clientSurname,
    bankName: client.bankName,
    status: client.status,
    categorized: client.categorized != null ? client.categorized : 0, // store as a number
    number_of_transactions: client.number_of_transactions,
    dateCreated: client.dateCreated ? client.dateCreated.toDate().toLocaleDateString("en-GB") : "",
    userEmail: client.userEmail,
  }));

  const columns = [
    { field: "id", headerName: "Client ID", width: 140 },
    { field: "clientName", headerName: "Name", width: 130 },
    { field: "clientSurname", headerName: "Surname", width: 130 },
    { field: "bankName", headerName: "Bank Name", width: 115 },
    { field: "status", headerName: "Status %", width: 130 },
    //{ field: "categorized", headerName: "Categorized %", width: 130 },
    {
      field: "categorized",
      headerName: "Categorized %",
      width: 130,
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
    { field: "number_of_transactions", headerName: "Transactions", width: 130 },
    { field: "dateCreated", headerName: "Date Created", width: 120 },
    { field: "userEmail", headerName: "Created By", width: 120 },
    // Action Button
    {
      field: "actions",
      headerName: "Actions",
      width: 135,
      renderCell: (params) => (
        <Button
          href={`/client/${params.row.id}`}
          variant="text"
          color="primary"
        >
          View Details
        </Button>
      ),
    },
    // Delete Button
    {
      field: "delete",
      headerName: "Delete",
      width: 135,
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
  ];

  return (
    <Grid container spacing={2} sx={{ mt: 4 }}>
      <Grid size={12}>
        <Paper 
          sx={{
            p: 2, 
            backgroundColor: "#1e1e1e" 
            }}
          >
          {rows.length === 0 ? (
            <Typography color="text.secondary">No clients found.</Typography>
          ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                slots={{ toolbar: CustomToolbar }}
                showToolbar
                sx={{
                  height: 690,
                  width: '100%',
                  overflow: 'auto',
                  '& .MuiDataGrid-cell': {
                    borderRight: '1px solid #444', // vertical border
                  },
                  '& .MuiDataGrid-row': {
                    backgroundColor: '#1e1e1e',
                    color: '#fff',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#2c2c2c',
                  },
                }}
              />
            )}  
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Table;
