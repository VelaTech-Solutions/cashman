import React, { useState, useEffect } from "react";
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
import HeaderFilter from "./Views/HeaderFilter";
import HeaderFooterFilter from "./Views/HeaderFooterFilter"
import IgnoredLines from "./Views/IgnoredLines";
import FuzzyIgnoredLines from "./Views/FuzzyIgnoredLines";
export default function filterSettingsPage() {
  const [activeTable, setActiveTable] = useState("headerFilter");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeTable === "headerFilter" ? "contained" : "outlined"}
            onClick={() => setActiveTable("headerFilter")}
          >
            Header Filter
          </Button>
          <Button
            variant={activeTable === "headerFooterFilter" ? "contained" : "outlined"}
            onClick={() => setActiveTable("headerFooterFilter")}
          >
            Header/Footer Filter
          </Button>
          <Button 
            variant={activeTable === "ignoredLines" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("ignoredLines")}
          >
            Ignored
          </Button>
          <Button 
            variant={activeTable === "fuzzyIgnoredLines" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("fuzzyIgnoredLines")}
          >
            Fuzzy Ignored
          </Button>
        </Stack>
        {activeTable === "headerFilter" && <HeaderFilter />}
        {activeTable === "headerFooterFilter" && <HeaderFooterFilter />}
        {activeTable === "ignoredLines" && <IgnoredLines />}
        {activeTable === "fuzzyIgnoredLines" && <FuzzyIgnoredLines />}
      </Stack>
    </Box>
  );
};
