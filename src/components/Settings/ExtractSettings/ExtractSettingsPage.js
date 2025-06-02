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

import ExtractAlignmentView from "./Views/ExtractAlignmentView";
import ExtractDescriptionView from "./Views/ExtractDescriptionView";
import ExtractDatesView from "./Views/ExtractDatesView";

export default function ExtractSettingsPage() {
  const [activeTable, setActiveTable] = useState("extractAlignmentView");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "extractAlignmentView" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("extractAlignmentView")}
          >
            Alignment
          </Button>
          <Button 
            variant={activeTable === "extractDescriptionView" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("extractDescriptionView")}
          >
            Description
          </Button>
          <Button 
            variant={activeTable === "extractDatesView" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("extractDatesView")}
          >
            Dates
          </Button>
        </Stack>
        {activeTable === "extractAlignmentView" && <ExtractAlignmentView />}
        {activeTable === "extractDescriptionView" && <ExtractDescriptionView />}
        {activeTable === "extractDatesView" && <ExtractDatesView />}
      </Stack>
    </Box>
  );
};
