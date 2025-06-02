import React, { useState } from "react";
// Mui Imports
import { 
  Box, 
  Button, 
  Stack
} from "@mui/material";
import InsuranceCurrentDataTable from "./Tables/InsuranceCurrentDataTable";
import InsuranceRestructureDataTable from "./Tables/InsuranceRestructureDataTable";
export default function InsuranceBreakdown({clientId}) {
  const [activeTable, setActiveTable] = useState("InsuranceCurrentDataTable");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "InsuranceCurrentDataTable" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("InsuranceCurrentDataTable")}
          >
            Current Insurance
          </Button>
          <Button 
            variant={activeTable === "InsuranceRestructureDataTable" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("InsuranceRestructureDataTable")}
          >
            Restructure Insurance
          </Button>
        </Stack>
        {activeTable === "InsuranceCurrentDataTable" && <InsuranceCurrentDataTable clientId={clientId} />}
        {activeTable === "InsuranceRestructureDataTable" && <InsuranceRestructureDataTable clientId={clientId} />}
      </Stack>
    </Box>
  );
};