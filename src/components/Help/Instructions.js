import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

export default function Instructions() {
  const [error, setError] = useState("");

  if (error) return <Typography color="error">Error: {error}</Typography>;

  const steps = [
    {
      title: "Step 1: Upload Bank Statement at Add Client",
      desc: "Enter your income sources and amounts in the Income section."
    },
    {
      title: "Step 2: Head to the Captured Client Profile",
      desc: "View the uploaded statements and related client data."
    },
    {
      title: "Step 3: Under Transactions Click Extract Transactions",
      desc: "This processes and organizes the raw bank statement data."
    },
    {
      title: "Step 4: Click Categorize Transactions",
      desc: "Assign categories to each transaction for budgeting accuracy."
    },
    {
      title: "Step 5: Head to Budget",
      desc: "Review and manage your categorized expenses against your budget."
    },
    {
      title: "Step 6: Finally, Generate a Report",
      desc: "View a full financial summary in the Reports section."
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
      <Typography variant="h3" gutterBottom>How to Use This App</Typography>
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
}
