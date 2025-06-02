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
        </Stack>

        {activeTable === "MainSettings" && <MainViews/>}
        {activeTable === "BankSettings" && <BankSettings/>}
      </Stack>
    </Box>
  );
};
