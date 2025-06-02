import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
// import { Button } from "components/Common";
import { Button, Select, MenuItem, Checkbox, TextField, FormControlLabel, Box, Switch, Stack } from "@mui/material";

export default function FuzzyLinesPage() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [fuzzyEnabled, setFuzzyEnabled] = useState(false)
  const [ignoredLines, setIgnoredLines] = useState([]);
  const [fuzzyIgnoredLines, setFuzzyIgnoredLines] = useState([]);
  const [selectedIgnored, setSelectedIgnored] = useState(new Set());
  const [selectedFuzzy, setSelectedFuzzy] = useState(new Set());

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
    const fetchLines = async () => {
      const ref = configDoc(selectedBank);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setIgnoredLines(snap.data().ignoredLines || []);
        setFuzzyIgnoredLines(snap.data().fuzzyIgnoredLines || []);
      } else {
        await setDoc(ref, {});
        setIgnoredLines([]);
        setFuzzyIgnoredLines([]);
      }
    };
    fetchLines();
  }, [selectedBank]);

  const updateFuzzyEnabled = async (value) => {
    setFuzzyEnabled(value);
    await setDoc(configDoc(selectedBank), { fuzzyEnabled: value }, { merge: true });
  };
    
  const addFuzzyLine = async () => {
    const input = document.querySelector("#fuzzyLineInput");
    const value = input.value.trim();
    if (!value) return;
    const updated = [...ignoredLines, value];
    await setDoc(configDoc(selectedBank), { fuzzyIgnoredLines: updated }, { merge: true });
    setFuzzyIgnoredLines(updated);
    input.value = "";
  };

  const handleCopyToFuzzy = async () => {
    const selected = Array.from(selectedIgnored).map((i) => ignoredLines[i]);
    const updated = [...new Set([...fuzzyIgnoredLines, ...selected])];
    try {
      await updateDoc(configDoc(selectedBank), { fuzzyIgnoredLines: updated });
      setFuzzyIgnoredLines(updated);
      setSelectedIgnored(new Set());
    } catch (err) {
      console.error("Failed to copy lines to fuzzy:", err);
    }
  };
  
  const deleteSelectedLines = async () => {
    const updated = fuzzyIgnoredLines.filter((_, i) => !selectedFuzzy.has(i));
    await setDoc(configDoc(selectedBank), { fuzzyIgnoredLines: updated }, { merge: true });
    setFuzzyIgnoredLines(updated);
    setSelectedFuzzy(new Set());
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
        id="fuzzyLineInput"
        label="Enter Line to Fuzzy Ignore"
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
                checked={fuzzyEnabled}
                onChange={(e) => updateFuzzyEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Fuzzy Lines"
          />
        </Box>
      )}

      {/* Box of Buttons */}
      <Box display="flex" gap={2} mb={4}>
        {/* Add Line Button */}
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={() => addFuzzyLine("fuzzy")}
          sx={{ flex: 1 }}
        >
          Add Fuzzy Line
        </Button>

        {/* Copy to Fuzzy Button */}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleCopyToFuzzy}
          sx={{ flex: 1 }}
          disabled={selectedIgnored.size === 0}
        >
          Copy to Fuzzy
        </Button>

        {/* Delete Line Button */}
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={() => deleteSelectedLines("fuzzy")}
          sx={{ flex: 1 }}
          disabled={selectedFuzzy.size === 0}
        >
          Delete Fuzzy Lines
        </Button>
      </Box>

      {/* Tables */}
      <Box className="max-h-64 overflow-y-auto border border-gray-700 rounded text-xs">
        {/* Ignored lines Table */}
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

      {/* fuzzy lines Table */}
      <Box className="max-h-64 overflow-y-auto border border-gray-700 rounded text-xs">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-2 py-2 w-[20px] border-b border-gray-700">Select</th>
              <th className="px-1 py-1 text-left border-b border-gray-700">Fuzzy Line</th>
            </tr>
          </thead>
          <tbody>
            {fuzzyIgnoredLines.length > 0 ? (
              fuzzyIgnoredLines.map((line, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="px-1 py-1 border-b border-gray-800">
                    <Checkbox
                      size="small"
                      checked={selectedFuzzy.has(i)}
                      onChange={() => {
                        const updated = new Set(selectedFuzzy);
                        updated.has(i) ? updated.delete(i) : updated.add(i);
                        setSelectedFuzzy(updated);
                      }}
                    />
                  </td>
                  <td className="px-1 py-1 border-b border-gray-700">{line}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="p-2 text-gray-500">
                  No Fuzzy lines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
      </Stack>
    </Box>
  );
};
