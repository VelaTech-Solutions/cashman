import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { Button } from "components/Common";

function ExtractRemovalView1() {
  const [banks, setBanks] = useState([]);
  const [removalSettings, setRemovalSettings] = useState({});
  const [selectedBank, setSelectedBank] = useState("");
  const [ignoredLines, setIgnoredLines] = useState([]);
  const [fuzzyIgnoredLines, setFuzzyIgnoredLines] = useState([]);
  const [selectedIgnored, setSelectedIgnored] = useState(new Set());
  const [selectedFuzzy, setSelectedFuzzy] = useState(new Set());

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const bankCollection = collection(db, "banks");
        const snapshot = await getDocs(bankCollection);
        const bankNames = snapshot.docs.map((doc) => doc.id);
        setBanks(bankNames);
        if (bankNames.length > 0) setSelectedBank(bankNames[0]);
      } catch (err) {
        console.error("Failed to load banks:", err);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchIgnoredLines = async () => {
      if (!selectedBank) return;
      try {
        const ref = doc(db, "banks", selectedBank);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setIgnoredLines(snap.data().ignoredLines || []);
          setFuzzyIgnoredLines(snap.data().fuzzyIgnoredLines || []);
        } else {
          setIgnoredLines([]);
          setFuzzyIgnoredLines([]);
        }
        setSelectedIgnored(new Set());
        setSelectedFuzzy(new Set());
      } catch (err) {
        console.error("Error loading ignored lines:", err);
      }
    };
    fetchIgnoredLines();
  }, [selectedBank]);

  useEffect(() => {
    const fetchOrCreateSettings = async () => {
      try {
        const bankSnapshot = await getDocs(collection(db, "banks"));
        const bankNames = bankSnapshot.docs.map((doc) => doc.id);
        setBanks(bankNames);

        const ref = doc(db, "settings", "removal");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          const defaultSettings = {};
          bankNames.forEach((name) => {
            defaultSettings[name] = false;
          });
          await setDoc(ref, defaultSettings);
          setRemovalSettings(defaultSettings);
        } else {
          setRemovalSettings(snap.data());
        }
      } catch (err) {
        console.error("Error loading removal settings:", err.message);
      }
    };

    fetchOrCreateSettings();
  }, []);

  const handleToggleRemoval = async (bank) => {
    const updated = { ...removalSettings, [bank]: !removalSettings[bank] };
    setRemovalSettings(updated);
    await updateDoc(doc(db, "settings", "removal"), updated);
  };

  const handleAddLine = async (type) => {
    const input = document.querySelector("#ignoredLineInput").value.trim();
    if (!input) return;

    const lines = type === "fuzzy" ? fuzzyIgnoredLines : ignoredLines;
    const updated = [...lines, input];

    try {
      await updateDoc(doc(db, "banks", selectedBank), {
        [type === "fuzzy" ? "fuzzyIgnoredLines" : "ignoredLines"]: updated,
      });
      type === "fuzzy" ? setFuzzyIgnoredLines(updated) : setIgnoredLines(updated);
      document.querySelector("#ignoredLineInput").value = "";
    } catch (err) {
      console.error(`Failed to add ${type} ignored line:`, err);
    }
  };

  const handleDeleteLines = async (type) => {
    const lines = type === "fuzzy" ? fuzzyIgnoredLines : ignoredLines;
    const selected = type === "fuzzy" ? selectedFuzzy : selectedIgnored;

    const updated = lines.filter((_, i) => !selected.has(i));
    try {
      await updateDoc(doc(db, "banks", selectedBank), {
        [type === "fuzzy" ? "fuzzyIgnoredLines" : "ignoredLines"]: updated,
      });
      type === "fuzzy" ? setFuzzyIgnoredLines(updated) : setIgnoredLines(updated);
      type === "fuzzy" ? setSelectedFuzzy(new Set()) : setSelectedIgnored(new Set());
    } catch (err) {
      console.error(`Failed to delete ${type} ignored lines:`, err);
    }
  };

  const handleCopyToFuzzy = async () => {
    const selected = Array.from(selectedIgnored).map((i) => ignoredLines[i]);
    const updated = [...new Set([...fuzzyIgnoredLines, ...selected])];
    try {
      await updateDoc(doc(db, "banks", selectedBank), { fuzzyIgnoredLines: updated });
      setFuzzyIgnoredLines(updated);
      setSelectedIgnored(new Set());
    } catch (err) {
      console.error("Failed to copy lines to fuzzy:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Bank Headers & Footers Removal</h2>

      <select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
        className="mb-6 p-2 rounded bg-gray-800 text-white border border-gray-700 w-full"
      >
        {banks.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </select>

      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-bold text-blue-400">Bank Headers & Footers Removal</h3>
        {banks.map((bank) => (
          <div key={bank} className="flex items-center gap-4">
            <span className="text-white w-32">{bank}</span>
            <label className="text-white">Remove Lines</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={removalSettings[bank] || false}
                onChange={() => handleToggleRemoval(bank)}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>

      <input
        id="ignoredLineInput"
        type="text"
        placeholder="Enter line to ignore"
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
      />

      <div className="mb-6 flex gap-2">
        <Button onClick={() => handleAddLine("normal")} text="Add Ignored Line" small className="bg-green-600 hover:bg-green-700" />
        <Button onClick={() => handleAddLine("fuzzy")} text="Add Fuzzy Ignored Line" small className="bg-purple-600 hover:bg-purple-700" />
      </div>

      <div className="flex justify-between mb-2">
        <Button onClick={() => handleDeleteLines("normal")} text="Delete Selected" small className="bg-red-600 hover:bg-red-700" disabled={selectedIgnored.size === 0} />
        <Button onClick={handleCopyToFuzzy} text="Copy to Fuzzy" small className="bg-blue-600 hover:bg-blue-700" disabled={selectedIgnored.size === 0} />
      </div>

      <div className="mb-6 max-h-64 overflow-y-auto border border-gray-700 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="p-2 border-b border-gray-700">Select</th>
              <th className="p-2 border-b border-gray-700">Ignored Line</th>
            </tr>
          </thead>
          <tbody>
            {ignoredLines.length > 0 ? (
              ignoredLines.map((line, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedIgnored.has(i)} onChange={() => {
                      const newSet = new Set(selectedIgnored);
                      newSet.has(i) ? newSet.delete(i) : newSet.add(i);
                      setSelectedIgnored(newSet);
                    }} />
                  </td>
                  <td className="p-2">{line}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-500">
                  No ignored lines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-700 rounded">
        <div className="mb-2 flex justify-end">
          <Button onClick={() => handleDeleteLines("fuzzy")} text="Delete Selected Fuzzy" small className="bg-red-600 hover:bg-red-700" disabled={selectedFuzzy.size === 0} />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="p-2 border-b border-gray-700">Select</th>
              <th className="p-2 border-b border-gray-700">Fuzzy Ignored Line</th>
            </tr>
          </thead>
          <tbody>
            {fuzzyIgnoredLines.length > 0 ? (
              fuzzyIgnoredLines.map((line, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedFuzzy.has(i)} onChange={() => {
                      const newSet = new Set(selectedFuzzy);
                      newSet.has(i) ? newSet.delete(i) : newSet.add(i);
                      setSelectedFuzzy(newSet);
                    }} />
                  </td>
                  <td className="p-2">{line}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-500">
                  No fuzzy ignored lines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExtractRemovalView1;
