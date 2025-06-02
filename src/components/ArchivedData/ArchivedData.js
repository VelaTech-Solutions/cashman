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
import { LoadClientData } from "components/Common";
import OverViews from "./OverViews/OverView";
import Tables from "./Tables/Table";

export default function ArchivedData({clientId}) {
  const [archiveData, setArchive] = useState([]);
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

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <OverViews data={archiveData} />
        <Tables data={archiveData} />
      </Stack>
    </Box>
  );
};


