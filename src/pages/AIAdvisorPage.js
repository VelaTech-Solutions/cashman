// src/pages/AIAdvisorPage.js
import React, { useState } from "react";
import { Box, TextField, Button, Paper, Stack, Typography, Grid} from "@mui/material";


export default function AIAdvisorPage({clientId}) {
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          AI Advisor Page
        </Typography>
      </Stack>
    </Box>
  );
};
