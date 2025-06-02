import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { Button, Select, MenuItem, Checkbox, TextField, FormControlLabel, Box, Switch, Stack } from "@mui/material";

export default function IgnoredLinesPage() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [ignoredEnabled, setIgnoredEnabled] = useState(false);
  const [fuzzyEnabled, setFuzzyEnabled] = useState(false);
  const [ignoredLines, setIgnoredLines] = useState([]);
  const [fuzzyIgnoredLines, setFuzzyIgnoredLines] = useState([]);
  const [selectedIgnored, setSelectedIgnored] = useState(new Set());
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
    const fetchIgnoredLines = async () => {
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        const data = snap.data();
        const updates = {};
  
        if (!("ignoredEnabled" in data)) updates.ignoredEnabled = false;
        if (!("fuzzyEnabled" in data)) updates.fuzzyEnabled = false;
        if (!("ignoredLines" in data)) updates.ignoredLines = [];
        if (!("fuzzyIgnoredLines" in data)) updates.fuzzyIgnoredLines = [];
  
        // Update document with any missing fields
        if (Object.keys(updates).length > 0) {
          await setDoc(ref, updates, { merge: true });
        }
  
        setIgnoredEnabled(data.ignoredEnabled ?? false);
        setFuzzyEnabled(data.fuzzyEnabled ?? false);
        setIgnoredLines(data.ignoredLines || []);
        setFuzzyIgnoredLines(data.fuzzyIgnoredLines || []);
      } else {
        const defaultData = {
          ignoredEnabled: false,
          fuzzyEnabled: false,
          ignoredLines: [],
          fuzzyIgnoredLines: [],
        };
        await setDoc(ref, defaultData);
        setIgnoredEnabled(defaultData.ignoredEnabled);
        setFuzzyEnabled(defaultData.fuzzyEnabled);
        setIgnoredLines(defaultData.ignoredLines);
        setFuzzyIgnoredLines(defaultData.fuzzyIgnoredLines);
      }
  
      setSelectedIgnored(new Set());
    };
  
    fetchIgnoredLines();
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
  const updateIgnoredEnabled = async (value) => {
    setIgnoredEnabled(value);
    await setDoc(configDoc(selectedBank), { ignoredEnabled: value }, { merge: true });
  };
  
  const addIgnoredLine = async () => {
    const input = document.querySelector("#ignoredLineInput");
    const value = input.value.trim();
    if (!value) return;
    const updated = [...ignoredLines, value];
    await setDoc(configDoc(selectedBank), { ignoredLines: updated }, { merge: true });
    setIgnoredLines(updated);
    input.value = "";
  };

  const deleteSelectedLines = async () => {
    const updated = ignoredLines.filter((_, i) => !selectedIgnored.has(i));
    await setDoc(configDoc(selectedBank), { ignoredLines: updated }, { merge: true });
    setIgnoredLines(updated);
    setSelectedIgnored(new Set());
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Manage Subcategories
      </Typography> */}
      <Stack spacing={2} >

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

      {/* Input Field */}
      <TextField
        id="ignoredLineInput"
        label="Enter Line to Ignore"
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

      {/* enable/disable section */}
      {selectedBank && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={ignoredEnabled}
                  onChange={(e) => updateIgnoredEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Ignored Lines"
            />
          </Box>
        )}

      {/* Box of Buttons */}
      <Box display="flex" gap={2} mb={4}>
        <Button 
          onClick={addIgnoredLine}
          variant="contained" 
          color="success" 
          sx={{ flex: 1 }}
          >
          Add Ignored Line
        </Button>
        <Button
          onClick={deleteSelectedLines}
          variant="contained"
          color="error"
          sx={{ flex: 1 }}
          disabled={selectedIgnored.size === 0}
        >
          Delete Selected
        </Button>
      </Box>

      {/* Ignored Lines Table */}
      <Box className="max-h-64 overflow-y-auto border border-gray-700 rounded text-xs">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-2 py-2 w-[20px] border-b border-gray-700">Select</th>
              <th className="px-1 py-1 text-left border-b border-gray-700">Ignored Line</th>
            </tr>
          </thead>
          <tbody>
            {ignoredLines.length > 0 ? (
              ignoredLines.map((line, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="px-1 py-1 border-b border-gray-800">
                    <Checkbox
                      size="small"
                      checked={selectedIgnored.has(i)}
                      onChange={() => {
                        const updated = new Set(selectedIgnored);
                        updated.has(i) ? updated.delete(i) : updated.add(i);
                        setSelectedIgnored(updated);
                      }}
                    />
                  </td>
                  <td className="px-1 py-1 border-b border-gray-700">{line}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-2 text-gray-500">
                  No ignored lines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      </Stack>
    </Box>
  );
}
