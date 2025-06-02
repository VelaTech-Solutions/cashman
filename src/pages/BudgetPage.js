// src/pages/Budget.js
import React, { useState } from "react";
import { Box, TextField, Button, Paper, Stack, Typography, Grid} from "@mui/material";

// Component Imports
import Budget from "../components/Budget/Budget";
import InsuranceBreakdown from "../components/Budget/InsuranceBreakdown";
import BudgetSummary from "../components/Budget/BudgetSummary";





export default function BudgetPage({clientId}) {
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Budget Section
        </Typography>
      </Stack>
    </Box>
  );
};
