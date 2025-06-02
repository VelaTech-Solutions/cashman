// src/components/Budget/Budget.js

import React, { useState, useEffect } from "react";
// Mui Imports
import { 
  Box, 
  Stack
} from "@mui/material";


import BudgetView from "components/Budget/Views/BudgetView";
export default function Budget({ clientId }) {

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <BudgetView clientId={clientId} />
      </Stack>
    </Box>
  );
}
