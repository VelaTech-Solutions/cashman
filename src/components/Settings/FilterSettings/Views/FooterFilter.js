import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { 
    Button, 
    Select, 
    MenuItem, 
    Checkbox, 
    Divider,
    Card,
    CardContent,
    TextField, 
    FormControlLabel, 
    Box, 
    Switch, 
    Stack,
    Typography,
    List,
    ListItem,
} from "@mui/material";

export default function FooterFilter() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");

  const [editingEntryKey, setEditingEntryKey] = useState(null);
  const [editingEntryData, setEditingEntryData] = useState(null);

  const [newEntryKey, setNewEntryKey] = useState("");
  const [entryData, setEntryData] = useState({});
  
  const configDoc = (bank) => doc(db, "settings", "footerFilter", bank, "config");

  const fieldsConfig = [
    { key: 'footerFilterEnabled', label: 'Enable Footer Extraction', type: 'boolean' },
    { key: 'footerEnd', label: 'Enter Footer End', type: 'string' }
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
    if (!entryName || !selectedBank) 
      return;
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
    if (data[entryName]) {
      alert("Already exists.");
      return;
    }
      const newEntryData = {
        [entryName]: defaultEntryData(),
      };
    await setDoc(ref, newEntryData, { merge: true });
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
    if (!selectedBank || !editingEntryKey || !editingEntryData) 
      return;
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
    const snap = await getDoc(ref);
    if (snap.exists()) setEntryData(snap.data());
  };

  const handleDelete = async (entryKey) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${entryKey}"?`);
    if (!confirmDelete || !selectedBank) 
      return;
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);
    if (!snap.exists()) 
      return;
      const data = snap.data();
      delete data[entryKey];
    await setDoc(ref, data);
      setEntryData(data);
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
                  {fieldsConfig.map(({ key, label, type }) => (
                    <Box key={key} sx={{ width: '100%', display: 'flex', alignItems: 'center', my: 1 }}>
                      {type === 'boolean' ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!editingEntryData?.[key]}
                            onChange={(e) => handleFieldChange(key, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={label}
                      />
                      ) : (
                        <TextField
                          label={label}
                          value={editingEntryData?.[key] || ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          fullWidth
                          margin="dense"
                        />
                      )}
                    </Box>
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
                <Card variant="outlined" sx={{ p: 2, mb: 2, width: '100%' }}>
                  <CardContent>
                    <Stack spacing={1} divider={<Divider flexItem />}>
                      {fieldsConfig.map(({ key, label, type }) => (
                        <Box key={key}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>{label}:</strong>{" "}
                            {type === 'boolean'
                              ? entryConfig?.[key]
                                ? 'Enabled ✅'
                                : 'Disabled ❌'
                              : entryConfig?.[key] || <em>—</em>}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(entryKey)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(entryKey)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </ListItem>
          ))}
        </List>
      </Stack>
    </Box>
  );
}
