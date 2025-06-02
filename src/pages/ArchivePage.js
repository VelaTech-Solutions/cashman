import React, { useEffect, useState } from "react";
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
// Component Imports
import { LoadClientData } from 'components/Common';
//import ArchivedData from "../components/ArchivedData/ArchivedData";



export default function ArchivePage({clientId}) {
  const [archive, setArchive] = useState([]);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        const archiveData = clientData.archive || [];
        setArchive(archiveData);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);
  
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        {/* <ArchivedData clientId={clientId}/> */}
      </Stack>
    </Box>
  );
};

