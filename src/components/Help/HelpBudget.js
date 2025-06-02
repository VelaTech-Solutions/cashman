// help/HelpBudget.js
// Instructions to help the user with Budgeting
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

export default function HelpBudget() {
  const [error, setError] = useState("");

  if (error) return <Typography color="error">Error: {error}</Typography>;

  const steps = [
    {
      title: "Step 1: Calculate & Save Budget",
      desc: "Click the 'Calculate & Save Budget' button to process your data. This triggers backend calculations to create your budget.",
    },
    {
      title: "Step 2: Update Insurance Information",
      desc: "If needed, add or edit your insurance details in the insurance section to keep your budget accurate.",
    },
    {
      title: "Step 3: Review Summary",
      desc: "Head to the summary page to carefully review all budget data for correctness before finalizing.",
    },
    {
      title: "Step 4: Download Budget Report",
      desc: "Download your budget report for your records or to share with your financial advisor.",
    },
  ];
  
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
      <Typography variant="h3" gutterBottom>Budget Instructions</Typography>
        <Paper sx={{ p: 3, bgcolor: "grey.800" }}>
          <Stack spacing={3}>
            {steps.map((step, i) => (
              <Box key={i}>
                <Typography variant="h6">{step.title}</Typography>
                <Typography variant="body2">{step.desc}</Typography>
                {i < steps.length - 1 && <Divider sx={{ my: 2, borderColor: "grey.700" }} />}
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};
