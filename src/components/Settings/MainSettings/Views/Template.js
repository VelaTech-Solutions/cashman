import React, { useState, useEffect } from 'react';
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
    ListItem
} from "@mui/material";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/firebase";

export default function TemplatePage() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  
  const [editingEntryKey, setEditingEntryKey] = useState(null);
  const [editingEntryData, setEditingEntryData] = useState(null);


  // Template Data here
  const [newEntryKey, setNewEntryKey] = useState("");
  const [entryData, setEntryData] = useState({});

  const configDoc = (bank) => doc(db, "settings", "templateSetting", bank, "config");

  const fieldsConfig = [
    { key: 'templateSetting1', label: 'Template Setting 1', type: 'string' },
    { key: 'templateSetting2', label: 'Template Setting 2', type: 'string' },
    { key: 'templateSetting3', label: 'Template Setting 3', type: 'string' },
    { key: 'templateSetting4', label: 'Template Setting 4', type: 'string' }
  ];

  const defaultEntryData = () => {
    const entry = {};
    for (const field of fieldsConfig) {
      switch (field.type) {
        case 'string':
          entry[field.key] = "";
          break;
        case 'boolean':
          entry[field.key] = false;
          break;
        case 'array':
          entry[field.key] = [];
          break;
        case 'object':
          entry[field.key] = {};
          break;
        default:
          entry[field.key] = null;
      }
    }
    return entry;
  };

  // Template
  // const fieldsConfig = [
  //   { key: 'templateSetting1', label: 'Template Setting 1', type: 'string' },
  //   { key: 'templateSetting2', label: 'Template Setting 2', type: 'boolean' },
  //   { key: 'templateSetting3', label: 'Template Setting 3', type: 'array' },
  //   { key: 'templateSetting4', label: 'Template Setting 4', type: 'object' },
  // ];

  // Template
  // const DefaultEntryData = () => {
  //   const entry = {};
  //   for (const field of fieldsConfig) {
  //     switch (field.type) {
  //       case 'string':
  //         entry[field.key] = "";
  //         break;
  //       case 'boolean':
  //         entry[field.key] = false;
  //         break;
  //       case 'array':
  //         entry[field.key] = [];
  //         break;
  //       case 'object':
  //         entry[field.key] = {};
  //         break;
  //       default:
  //         entry[field.key] = null;
  //     }
  //   }
  //   return entry;
  // };

  // fetch Bank Name list
  useEffect(() => {
    const fetchBanks = async () => {
      const snap = await getDoc(doc(db, "settings", "banks"));
      if (snap.exists()) setBanks(snap.data().banks || []);
    };
    fetchBanks();
  }, []);
  
  //fecth selectedBank Settings
  useEffect(() => {
    if (!selectedBank) return;
    const fetchSettings = async () => {
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setEntryData(data); 
      } else {
        setEntryData({});
      }
    };

    fetchSettings();
  }, [selectedBank]);

  const handleAdd = async () => {
    const entryName = newEntryKey.trim();
    if (!entryName || !selectedBank) return;

    const ref = configDoc(selectedBank);
    const snap = await getDoc(ref);

    // If no doc yet, start with empty object
    const data = snap.exists() ? snap.data() : {};

    if (data[entryName]) {
      alert("Already exists.");
      return;
    }

    const newEntryData = {
      [entryName]: defaultEntryData(),
    };

    await setDoc(ref, newEntryData, { merge: true });

    // Update local state here to reflect change immediately
    setEntryData(prev => ({
      ...prev,
      [entryName]: newEntryData[entryName]
    }));

    alert(`✅ ${entryName} Added successfully`);
    setNewEntryKey(""); // Clear input
  };

  const handleEdit = (entryKey) => {
    const entryEditData = entryData[entryKey];
    setEditingEntryKey(entryKey);
    setEditingEntryData(entryEditData);
  };

  const handleFieldChange = (field, value) => {
    setEditingEntryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedBank || !editingEntryKey || !editingEntryData) return;

    const ref = configDoc(selectedBank);
    await setDoc(ref, {
      [editingEntryKey]: {
        ...entryData[editingEntryKey],
        ...editingEntryData,
      }
    }, { merge: true });

    alert(`✅ ${editingEntryKey} updated successfully`);
    setEditingEntryKey(null);
    setEditingEntryData(null);

    // refresh data
    const snap = await getDoc(ref);
    if (snap.exists()) setEntryData(snap.data());
  };

  const handleDelete = async (entryKey) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${entryKey}"?`);
    if (!confirmDelete || !selectedBank) return;

    const ref = configDoc(selectedBank);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    delete data[entryKey]; // remove from object

    await setDoc(ref, data); // overwrite with updated object

    setEntryData(data); // update local state
    alert(`🗑️ "${entryKey}" deleted`);
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

        {/* add, edit, remove */}
        {selectedBank && (
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="New Entry Key"
              variant="outlined"
              value={newEntryKey}
              onChange={(e) => setNewEntryKey(e.target.value)}
            />
            <Button
              variant="contained" 
              color="success" 
              onClick={handleAdd}
              disabled={!newEntryKey}
            >
              Add 
            </Button>
          </Stack>
          
        )}
        {selectedBank && (
          <Typography variant="h6">View Existing</Typography>
        )}
        
        <List>
          {Object.entries(entryData).map(([entryKey, entryConfig]) => (
            <ListItem
              key={entryKey}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                borderBottom: '1px solid #ccc',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">
                <strong>{entryKey}</strong>
              </Typography>
              {editingEntryKey === entryKey ? (
                <>
                  {fieldsConfig.map(({ key, label }) => (
                    <TextField
                      key={key}
                      label={label}
                      value={editingEntryData?.[key] || ""}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      fullWidth
                      margin="dense"
                    />
                  ))}
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEditingEntryKey(null);
                        setEditingEntryData(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </>
              ) : (
                <>
                  {fieldsConfig.map(({ key, label }) => (
                    <Typography key={key} variant="body2">
                      {label}: {entryConfig?.[key] || ""}
                    </Typography>
                  ))}
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" variant="outlined" onClick={() => handleEdit(entryKey)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(entryKey)}>Delete</Button>
                  </Stack>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Stack>
    </Box>
  );
}

