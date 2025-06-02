import React, { useState } from "react";
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
import UncategorizedTable from "./Tables/UncategorizedTable";
import CategorizedTable from "./Tables/CategorizedTable";
export default function NormalCategorizer({ clientId }) {
  const [activeTable, setActiveTable] = useState("uncategorizedTable");

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "uncategorizedTable" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("uncategorizedTable")}
          >
            Uncategorized
          </Button>
          <Button 
            variant={activeTable === "categorizedTable" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("categorizedTable")}
          >
            Categorized
          </Button>
        </Stack>

        {activeTable === "uncategorizedTable" && <UncategorizedTable clientId={clientId}/>}
        {activeTable === "categorizedTable" && <CategorizedTable clientId={clientId}/>}
      </Stack>
    </Box>
  );
};
