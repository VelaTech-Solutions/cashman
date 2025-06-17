import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { 
    Button, 
    Select, 
    MenuItem, 
    Checkbox, 
    TextField, 
    FormControlLabel, 
    Box, 
    Switch, 
    Stack,
    Typography,
    List,
    ListItem,
} from "@mui/material";

export default function HeaderFilter() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  const [headerFilterEnabled, setHeaderFilterEnabled] = useState(false);

  const [headerEnd, setHeaderEnd] = useState([]);


  const [selectedHeader, setSelectedHeader] = useState(new Set());
  const [removalSettings, setRemovalSettings] = useState({});
  
  const configDoc = (bank) => doc(db, "settings", "filter", bank, "config");

  // fetch Bank Name list
  useEffect(() => {
    const fetchBanks = async () => {
      const snap = await getDoc(doc(db, "settings", "banks"));
      if (snap.exists()) setBanks(snap.data().banks || []);
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (!selectedBank) return;
    const fetchBlocks = async () => {
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        const data = snap.data();
        const updates = {};
  
        if (!("headerFilterEnabled" in data)) updates.headerFilterEnabled = false;
        if (!("headerEnd" in data)) updates.headerEnd = [];

  
        // Update document with any missing fields
        if (Object.keys(updates).length > 0) {
          await setDoc(ref, updates, { merge: true });
        }
  
        setHeaderFilterEnabled(data.headerFilterEnabled ?? false);
        setHeaderEnd(data.headerEnd || []);

      } else {
        const defaultData = {
          headerFilterEnabled: false,
          headerEnd: [],
        };
        await setDoc(ref, defaultData);
        setHeaderFilterEnabled(defaultData.headerFilterEnabled);
        setHeaderEnd(defaultData.headerEnd);
      }
  
      setSelectedHeader(new Set());
    };
  
    fetchBlocks();
  }, [selectedBank]);
  
  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, "settings", "removal"));
      if (snap.exists()) {
        setRemovalSettings(snap.data());
      } else {
        const defaults = Object.fromEntries(banks.map((b) => [b, false]));
        await setDoc(doc(db, "settings", "removal"), defaults);
        setRemovalSettings(defaults);
      }
    };
    fetchSettings();
  }, [banks]);

  const updateBlockEnabled = async (value) => {
    setHeaderFilterEnabled(value);
    await setDoc(configDoc(selectedBank), { headerFilterEnabled: value }, { merge: true });
  };
  
  const addHeader = async () => {
    const input = document.querySelector("#headerEndInput");
    const value = input.value.trim();
    if (!value) return;
    const updated = [...headerEnd, value];
    await setDoc(configDoc(selectedBank), { headerEnd: updated }, { merge: true });
    setHeaderEnd(updated);
    input.value = "";
  };

  const deleteSelected = async () => {
    const updated = headerEnd.filter((_, i) => !selectedHeader.has(i));
    await setDoc(configDoc(selectedBank), { headerEnd: updated }, { merge: true });
    setHeaderEnd(updated);
    setSelectedHeader(new Set());
  };




  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>

        {/* Select Bank Field */}
        <Select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            fullWidth
            variant="outlined"
            displayEmpty
            renderValue={(selected) => selected || "Select Bank"}
            sx={{
            mb: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
            }}
        >
            {banks.map((bank) => (
            <MenuItem key={bank} value={bank}>{bank}</MenuItem>
            ))}
        </Select>

        {/* enable/disable Block */}
        {selectedBank && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
              <FormControlLabel
                control={
                    <Switch
                        checked={headerFilterEnabled}
                        onChange={(e) => updateBlockEnabled(e.target.checked)}
                        color="primary"
                    />
                }
                label="Enable Header Extraction"
              />
          </Box>
        )}

        {/* Input Field */}
        <TextField
            id="headerEndInput"
            label="Enter Where Header End"
            variant="outlined"
            fullWidth
            sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "gray" },
                    "&:hover fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                },
            }}
        />
        <Box display="flex" gap={2} mb={4}>
            <Button 
                onClick={() => {
                    addHeader();
                    }}
                variant="contained" 
                color="success" 
                sx={{ flex: 1 }}
                >
                Add Where Header Ends
                </Button>
                <Button
                onClick={deleteSelected}
                variant="contained"
                color="error"
                sx={{ flex: 1 }}
                disabled={selectedHeader.size === 0}
                >
                Delete
            </Button>
        </Box>
        {/* Display Blocks */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Defined Header</Typography>
          <List>
            {headerEnd.map((entry, index) => (
            <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                checked={selectedHeader.has(index)}
                onChange={() => {
                    const newSet = new Set(selectedHeader);
                    if (newSet.has(index)) {
                    newSet.delete(index);
                    } else {
                    newSet.add(index);
                    }
                    setSelectedHeader(newSet);
                }}
                />
                <Box>
                <Typography variant="body2">
                    Header End {index + 1}: "{entry}"
                </Typography>
                </Box>
            </ListItem>
            ))}
          </List>
        </Box>

      </Stack>
    </Box>
  );
}


// Uncaught runtime errors:
// ×
// ERROR
// Invalid document reference. Document references must have an even number of segments, but settings/filter/config has 3.
// FirebaseError: Invalid document reference. Document references must have an even number of segments, but settings/filter/config has 3.