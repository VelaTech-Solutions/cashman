import React, { useState, useMemo, useEffect } from "react";

// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Component Imports
import { BaseTable, FirestoreHelper } from "../Utils/";
import { LoadClientData, CategoryColor, Loader } from "components/Common";

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, TextField, Box, Typography } from "@mui/material";
// import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';


const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

const columns = [
  // {
  //   field: "category",
  //   headerName: "Category",
  //   width: 200,
  //   editable: true,
  // },
  // // {
  // //   field: "amount",
  // //   headerName: "Amount",
  // //   width: 200,
  // //   editable: true,
  // // },
  // {
  //   field: "date1",
  //   headerName: "Date",
  //   width: 200,
  //   editable: true,
  // },
  { field: "date1", headerName: "Date", width: 150, editable: true },
  { field: "date2", headerName: "Date2", width: 150, editable: true },
  { field: "description", headerName: "Description", width: 250, editable: true },
  { field: "description2", headerName: "Description2", width: 250, editable: true },
  { field: "credit_amount", headerName: "Credit", width: 120, editable: true },
  { field: "debit_amount", headerName: "Debit", width: 120, editable: true },
  { field: "balance_amount", headerName: "Balance", width: 120, editable: true },
];



const OriginalTable = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  // console.log("🟡 transactions:", transactions);


  useEffect(() => {
    const fetchData = async () => {
          try {
          const clientData = await LoadClientData(clientId);
          setClientData(clientData);
          setTransactions(clientData.transactions || []);

          } catch (err) {
          console.error("Error fetching data:", err.message);
          setError("Failed to fetch Client Data.");
          }
      };
  
      fetchData();
      }, [clientId]);

  if (error) return <p className="text-red-500">{error}</p>;

  return (

    <ThemeProvider theme={theme}>
      {/* <Box sx={{ height: 400, width: '100%', mt: 2 }}>
      <DataGrid
        rows={transactions}
        getRowId={(row) => row.uid}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
      />

      </Box> */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={transactions.map((t) => ({ id: t.uid, ...t }))}
          columns={columns}
          checkboxSelection
          //onSelectionModelChange={handleSelectionModelChange}
        />
      </div>
    </ThemeProvider>
  );
};



export default OriginalTable;


