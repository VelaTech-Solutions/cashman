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
export default function EditSettings() {

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Edit Settings
      </Typography>
      <Stack spacing={2}>
      </Stack>
    </Box>
  );
};