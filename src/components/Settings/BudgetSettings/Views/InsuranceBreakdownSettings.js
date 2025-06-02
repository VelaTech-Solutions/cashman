import React, { useState } from "react";
// Mui Imports
import { 
  Box, 
  Button,  
  Stack
} from "@mui/material";
import CurrentSettings from "../Tables/CurrentSettings";
import RestructureSettings from "../Tables/RestructureSettings";

export default function InsuranceBreakdownSettings() {
  const [activeTable, setActiveTable] = useState("currentSettings");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
        <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "currentSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("currentSettings")}
          >
            Current Settings
          </Button>
          <Button 
            variant={activeTable === "restructureSettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("restructureSettings")}
          >
            Restructure Settings
          </Button>
        </Stack>

        {activeTable === "currentSettings" && <CurrentSettings />}
        {activeTable === "restructureSettings" && <RestructureSettings />}
       </Stack>
    </Box>
  );
};