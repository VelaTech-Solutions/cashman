import React, { useState, useEffect } from "react";


// Firebase Imports
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

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
  InputLabel,
  FormControl,
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

// settings


export default function ExcelSheetSettings() {
  const configDoc = doc(db, "settings", "budget", "config", "excel");

  const [loading, setLoading] = useState(true);
  const [styles, setStyles] = useState({
    headerColor: "#000000",
    headerFontSize: 14,
    borderStyle: "thin",
    // add more style keys here...
  });

  useEffect(() => {
    async function loadSettings() {
      const snap = await getDoc(configDoc);
      if (snap.exists()) {
        setStyles(snap.data());
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function saveSettings() {
    await updateDoc(configDoc, styles);
  }

  if (loading) return <Typography>Loading...</Typography>;

  return (
        <Box p={2}>

                  <Typography variant="h6" mb={2} >
        Excel Sheet Styling Settings
      </Typography>
<Grid container spacing={2}>

    {/* the header opioins goes here first */}
    {/* <Box
      sx={{
        maxWidth: 320,
        p: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        bgcolor: '#222',
        color: 'white',
      }}
    > */}
      <Grid item xs={12} sm={6} md={4}   sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
        Header Styling
      </Typography>

      <TextField
        label="Background Color"
        type="color"
        defaultValue="#d9e4f5"
        fullWidth
        margin="dense"
        size="small"
        InputLabelProps={{ style: { color: 'white' } }}
        inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
      />

      <TextField
        label="Font Size"
        type="number"
        defaultValue={14}
        fullWidth
        margin="dense"
        size="small"
        InputLabelProps={{ style: { color: 'white' } }}
        inputProps={{ min: 8, max: 72, style: { color: 'white', backgroundColor: '#222' } }}
      />

      <TextField
        label="Font Color"
        type="color"
        defaultValue="#000000"
        fullWidth
        margin="dense"
        size="small"
        InputLabelProps={{ style: { color: 'white' } }}
        inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
      />

      <FormControl fullWidth margin="dense" size="small">
        <InputLabel id="border-style-label" sx={{ color: 'white' }}>
          Border Style
        </InputLabel>
        <Select
          labelId="border-style-label"
          defaultValue="thin"
          label="Border Style"
          sx={{
            color: 'white',
            '.MuiSelect-icon': { color: 'white' },
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          }}
        >
          <MenuItem value="none">No Border</MenuItem>
          <MenuItem value="thin">Thin</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="thick">Thick</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" sx={{ mt: 2 }} fullWidth>
        Save
      </Button>
    </Grid>

{/* <Box
  sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}
> */}
  <Grid item xs={12} sm={6} md={4}   sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}>
  <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
    Category Row Styling
  </Typography>

  <TextField
    label="Background Color"
    type="color"
    defaultValue="#fce4ec"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Size"
    type="number"
    defaultValue={12}
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ min: 8, max: 72, style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Color"
    type="color"
    defaultValue="#000000"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <FormControl fullWidth margin="dense" size="small">
    <InputLabel id="cat-border-style-label" sx={{ color: 'white' }}>
      Border Style
    </InputLabel>
    <Select
      labelId="cat-border-style-label"
      defaultValue="medium"
      label="Border Style"
      sx={{
        color: 'white',
        '.MuiSelect-icon': { color: 'white' },
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
      }}
    >
      <MenuItem value="none">No Border</MenuItem>
      <MenuItem value="thin">Thin</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="thick">Thick</MenuItem>
    </Select>
  </FormControl>

  <Button variant="contained" sx={{ mt: 2 }} fullWidth>
    Save
  </Button>
</Grid>


  <Grid item xs={12} sm={6} md={4}   sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}>
  <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
    SubCategory Row Styling
  </Typography>

  <TextField
    label="Background Color"
    type="color"
    defaultValue="#fce4ec"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Size"
    type="number"
    defaultValue={12}
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ min: 8, max: 72, style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Color"
    type="color"
    defaultValue="#000000"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <FormControl fullWidth margin="dense" size="small">
    <InputLabel id="subcat-border-style-label" sx={{ color: 'white' }}>
      Border Style
    </InputLabel>
    <Select
      labelId="subcat-border-style-label"
      defaultValue="medium"
      label="Border Style"
      sx={{
        color: 'white',
        '.MuiSelect-icon': { color: 'white' },
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
      }}
    >
      <MenuItem value="none">No Border</MenuItem>
      <MenuItem value="thin">Thin</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="thick">Thick</MenuItem>
    </Select>
  </FormControl>

  <Button variant="contained" sx={{ mt: 2 }} fullWidth>
    Save
  </Button>
</Grid>


  <Grid item xs={12} sm={6} md={4}   sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}>
  <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
    Totals Row Styling
  </Typography>

  <TextField
    label="Background Color"
    type="color"
    defaultValue="#fce4ec"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Size"
    type="number"
    defaultValue={12}
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ min: 8, max: 72, style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Color"
    type="color"
    defaultValue="#000000"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <FormControl fullWidth margin="dense" size="small">
    <InputLabel id="total-border-style-label" sx={{ color: 'white' }}>
      Border Style
    </InputLabel>
    <Select
      labelId="total-border-style-label"
      defaultValue="medium"
      label="Border Style"
      sx={{
        color: 'white',
        '.MuiSelect-icon': { color: 'white' },
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
      }}
    >
      <MenuItem value="none">No Border</MenuItem>
      <MenuItem value="thin">Thin</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="thick">Thick</MenuItem>
    </Select>
  </FormControl>

  <Button variant="contained" sx={{ mt: 2 }} fullWidth>
    Save
  </Button>
</Grid>



  <Grid item xs={12} sm={6} md={4}   sx={{
    maxWidth: 320,
    p: 2,
    border: '1px solid #ccc',
    borderRadius: 2,
    bgcolor: '#222',
    color: 'white',
    mt: 3,
  }}>
  <Typography variant="subtitle1" sx={{ mb: 1, color: 'white' }}>
    Average Row Styling
  </Typography>

  <TextField
    label="Background Color"
    type="color"
    defaultValue="#fce4ec"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Size"
    type="number"
    defaultValue={12}
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ min: 8, max: 72, style: { color: 'white', backgroundColor: '#222' } }}
  />

  <TextField
    label="Font Color"
    type="color"
    defaultValue="#000000"
    fullWidth
    margin="dense"
    size="small"
    InputLabelProps={{ style: { color: 'white' } }}
    inputProps={{ style: { color: 'white', backgroundColor: '#222' } }}
  />

  <FormControl fullWidth margin="dense" size="small">
    <InputLabel id="average-border-style-label" sx={{ color: 'white' }}>
      Border Style
    </InputLabel>
    <Select
      labelId="average-border-style-label"
      defaultValue="medium"
      label="Border Style"
      sx={{
        color: 'white',
        '.MuiSelect-icon': { color: 'white' },
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'gray' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
      }}
    >
      <MenuItem value="none">No Border</MenuItem>
      <MenuItem value="thin">Thin</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="thick">Thick</MenuItem>
    </Select>
  </FormControl>

  <Button variant="contained" sx={{ mt: 2 }} fullWidth>
    Save
  </Button>
</Grid>



    </Grid>

    </Box>
  );
}