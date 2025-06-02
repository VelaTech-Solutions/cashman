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

import BudgetSettingView from "./Views/BudgetSettingView"
import CategoryCellPlacement from "./Views/CategoryCellPlacement"
import MonthCellPlacement from "./Views/MonthCellPlacement"
import InsuranceBreakdown from "./Views/InsuranceBreakdownSettings";
import ExcelSheetSettings from "./Views/ExcelSheetSettings";

export default function BudgetSettingsPage() {
  const [activeTable, setActiveTable] = useState("BudgetSettingView");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Budget Settings
      </Typography> */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "BudgetSettingView" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("BudgetSettingView")}
          >
            Settings
          </Button>
          <Button 
            variant={activeTable === "CategoryCellPlacement" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("CategoryCellPlacement")}
          >
            Category Cell Placement
          </Button>
          <Button 
            variant={activeTable === "MonthCellPlacement" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("MonthCellPlacement")}
          >
            Month Cell Placement
          </Button>
          <Button 
            variant={activeTable === "InsuranceBreakdown" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("InsuranceBreakdown")}
          >
            Insurance Breakdown
          </Button>
          <Button 
            variant={activeTable === "ExcelSheetSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("ExcelSheetSettings")}
          >
            Excel Sheet Settings
          </Button>
        </Stack>
        {activeTable === "BudgetSettingView" && <BudgetSettingView />}
        {activeTable === "CategoryCellPlacement" && <CategoryCellPlacement />}
        {activeTable === "MonthCellPlacement" && <MonthCellPlacement />}
        {activeTable === "InsuranceBreakdown" && <InsuranceBreakdown />}
        {activeTable === "ExcelSheetSettings" && <ExcelSheetSettings />}
      </Stack>
    </Box>
  );
};