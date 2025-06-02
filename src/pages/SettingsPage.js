// src/pages/Settings.js

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

import MainSettings from "../components/Settings/MainSettings/MainSettings";
import DatabaseSettings from "../components/Settings/DatabaseSettings/DatabaseSettingsPage";
import FilterSettings from "../components/Settings/FilterSettings/filterSettingsPage";
import CategorySettings from "../components/Settings/CategorySettings/CategorySettingsPage";
import ExtractSettings from "../components/Settings/ExtractSettings/ExtractSettingsPage";
import BudgetSettings from "../components/Settings/BudgetSettings/BudgetSettingsPage";
import EditSettings from "../components/Settings/EditSettings/EditSettings";
import ViewSettings from "../components/Settings/ViewSettings/ViewSettings";

export default function SettingsPage() {
  const [activeTable, setActiveTable] = useState("mainSettings");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "mainSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("mainSettings")}
          >
            Main Settings
          </Button>
          <Button 
            variant={activeTable === "databaseSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("databaseSettings")}
          >
            Database Settings
          </Button>
          <Button 
            variant={activeTable === "budgetSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("budgetSettings")}
          >
            Budget Settings
          </Button>
          <Button 
            variant={activeTable === "categorySettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("categorySettings")}
          >
            Category Settings
          </Button>
          <Button 
            variant={activeTable === "filterSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("filterSettings")}
          >
            Filter Settings
          </Button>
          <Button 
            variant={activeTable === "extractSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("extractSettings")}
          >
            Extract Settings
          </Button>
          <Button 
            variant={activeTable === "editSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("editSettings")}
          >
            Edit Settings
          </Button>
          <Button 
            variant={activeTable === "viewSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("viewSettings")}
          >
            View Settings
          </Button>
        </Stack>

        {activeTable === "mainSettings" && <MainSettings />}
        {activeTable === "databaseSettings" && <DatabaseSettings />}
        {activeTable === "budgetSettings" && <BudgetSettings />}
        {activeTable === "filterSettings" && <FilterSettings />}
        {activeTable === "categorySettings" && <CategorySettings />}        
        {activeTable === "extractSettings" && <ExtractSettings />}
        {activeTable === "editSettings" && <EditSettings />}
        {activeTable === "viewSettings" && <ViewSettings />}      

      </Stack>
    </Box>
  );
};
