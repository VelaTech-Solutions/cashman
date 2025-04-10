import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  getDocs,
  collection,
} from "firebase/firestore";

const ExtractDatesView4 = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [dateSettings, setDateSettings] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [rejectsForExample, setRejectsForExample] = useState({}); // Rejects for the example date

  const bankRef = (bank) => doc(db, "settings", "dates", bank, "config");

  // Fetch banks and rejects for each
  useEffect(() => {
    const fetchBanks = async () => {
      const bankSnapshot = await getDocs(collection(db, "banks"));
      const bankNames = bankSnapshot.docs.map((doc) => doc.id);
      setBanks(bankNames);

      if (bankNames.length > 0) setSelectedBank(bankNames[0]); // Auto-select first bank
    };

    fetchBanks();
  }, []);

  // Fetch reject settings for each bank
  useEffect(() => {
    const fetchRejects = async () => {
      let allRejects = {};
      for (let bank of banks) {
        const ref = bankRef(bank);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          allRejects[bank] = snap.data();
        } else {
          allRejects[bank] = {};
        }
      }
      setDateSettings(allRejects); // Set reject data for all banks
    };

    if (banks.length > 0) fetchRejects(); // Only fetch if there are banks
  }, [banks]);

  // Handle regex change
  const handleRegexChange = async (label, newPattern) => {
    const updated = {
      ...dateSettings,
      [selectedBank]: {
        ...dateSettings[selectedBank],
        [label]: {
          ...dateSettings[selectedBank][label],
          pattern: newPattern,
        },
      },
    };
    setDateSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[selectedBank][label],
    });
  };

  const sanitizeKey = (label) =>
    label.replace(/\//g, "_slash_")
         .replace(/\[/g, "_open_")
         .replace(/\]/g, "_close_")
         .replace(/\./g, "_dot_"); // optional for extra safety
  
  const handleAddSetting = async () => {
    if (!newLabel || !newRegex) return;
  
    const safeLabelKey = sanitizeKey(newLabel);
  
    const newEntry = {
      label: newLabel, // Keep original for display
      pattern: newRegex,
    };
  
    const updated = {
      ...dateSettings,
      [selectedBank]: {
        ...dateSettings[selectedBank],
        [safeLabelKey]: newEntry,
      },
    };
  
    setDateSettings(updated);
  
    await updateDoc(bankRef(selectedBank), {
      [safeLabelKey]: newEntry,
    });
  
    setNewLabel("");
    setNewRegex("");
  };
  

  const handleDeleteEntry = async (labelKey, bank) => {
    const updated = {
      ...dateSettings,
      [bank]: {
        ...dateSettings[bank],
        [labelKey]: deleteField(),
      },
    };
    setDateSettings(updated);
    await updateDoc(bankRef(bank), {
      [labelKey]: deleteField(),
    });
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Bank Date Extraction Rules</h3>
        <p className="text-sm text-gray-400">
          Manage the date extraction rules per bank to ensure accurate transaction matching.
        </p>


      {/* Current Regex Settings */}
      <div className="mb-6 p-4 ">
        <div className="space-y-4 ">
          {Object.entries(dateSettings).map(([bank, settings]) => (
            <div key={bank} className="border-b border-gray-700 pb-3">
              <h5 className="font-medium text-lg">{bank}</h5>

              {Object.entries(settings).map(([labelKey, data]) => (
                <div key={labelKey} className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">To Find: {data.label || labelKey}</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDeleteEntry(labelKey, bank)}
                        className="text-red-500 hover:text-red-700 transition-all duration-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{data.pattern}</div>
                </div>
              ))}


            </div>
          ))}
        </div>
      </div>

      {/* Add New Rule */}
      <div className="mt-6 p-4 rounded bg-gray-800 border border-gray-700">
        <h4 className="text-lg font-semibold mb-4">Add a New Date Pattern Extraction</h4>

        {/* select bank */}
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="mb-4 p-2 rounded bg-gray-800 text-white border border-gray-700"
        >
          {banks.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g., Transaction Date)"
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white border border-gray-600"
        />
        <input
          type="text"
          value={newRegex}
          onChange={(e) => setNewRegex(e.target.value)}
          placeholder="Regex Pattern"
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          onClick={handleAddSetting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-300"
        >
          Add Bank Rule
        </button>
      </div>
    </div>
  );
};

export default ExtractDatesView4;
