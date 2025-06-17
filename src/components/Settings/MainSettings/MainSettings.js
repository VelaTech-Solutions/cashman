// src/components/Settings

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


import MainViews from "./Views/MainViews";
import BankSettings from "./Views/BankSettings";
import BankOptions from "./Views/BankOptions";
import Template from "./Views/Template";

export default function MainSettings() {
  const [activeTable, setActiveTable] = useState("MainSettings");

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "MainSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("MainSettings")}
          >
            Main Settings
          </Button>
          <Button 
            variant={activeTable === "BankSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("BankSettings")}
          >
            Bank Settings
          </Button>
          <Button
            variant={activeTable === "BankOptions" ? "contained" : "outlined"}
            onClick={() => setActiveTable("BankOptions")}
          >
            Bank Options
          </Button>
          <Button
            variant={activeTable === "Template" ? "contained" : "outlined"}
            onClick={() => setActiveTable("Template")}
          >
            Template
          </Button>
          
        </Stack>

        {activeTable === "MainSettings" && <MainViews/>}
        {activeTable === "BankSettings" && <BankSettings />}
        {activeTable === "BankOptions" && <BankOptions />}
        {activeTable === "Template" && <Template />}
      </Stack>
    </Box>
  );
};
