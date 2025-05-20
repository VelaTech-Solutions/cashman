import React, { useState, useEffect } from "react";


// Firebase Imports
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Common Components Import
import { loadCategories, loadSubcategories } from "components/Common";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import { 
  Grid, 
  Box, 
  Chip, 
  Divider,
  Stack,
  CircularProgress, 
  InputAdornment, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Checkbox, 
  TextField, 
  Paper,
  Table,
  Tabs,
  Tab,

  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableContainer,
  FormControlLabel,
  Switch
} from "@mui/material";

import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

// settings cat excel cell placement


export default function BudgetSettingsView() {


  return (
      <Typography variant="h6" sx={{ mb: 2 }}>
        Budget Settings
      </Typography>

  );

};