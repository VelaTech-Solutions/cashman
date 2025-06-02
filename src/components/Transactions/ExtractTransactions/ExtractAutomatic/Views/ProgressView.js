import React from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Stack,
  Chip,
} from "@mui/material";

export default function ProgressView({
  progressData,
  extractionStatus,
}) {
  const combinedStatus = { ...progressData, ...extractionStatus };
  const steps = Object.entries(combinedStatus);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(([, status]) => status === "success").length;

  let progress = (completedSteps / totalSteps) * 100;
  const allDone = steps.every(([, status]) => status === "success");
  if (allDone) progress = 100;

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Paper
        sx={{
          p: 3,
          border: "1px solid #333",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Extraction Progress
        </Typography>

        <Box sx={{ position: "relative", mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 6,
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(to right, #a3e635, #86efac, #34d399)",
              },
            }}
          />
          {progress === 100 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "black",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: 6,
              }}
            >
              ✅ Done!
            </Box>
          )}
        </Box>

        <Stack spacing={1}>
          {steps.map(([step, status], index) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  color:
                    status === "success"
                      ? "#a3e635"
                      : status === "processing"
                      ? "#fde047"
                      : "#f87171",
                }}
              >
                {status === "success"
                  ? "✔️"
                  : status === "processing"
                  ? "⏳"
                  : "❌"}
              </Typography>
              <Typography variant="body2" noWrap>
                {step}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
