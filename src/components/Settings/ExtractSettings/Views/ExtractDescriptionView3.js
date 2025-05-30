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

const ExtractDescriptionView3 = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [descriptionSettings, setDescriptionSettings] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newRegex, setNewRegex] = useState("");

  const bankRef = (bank) => doc(db, "settings", "description", bank, "config");

  useEffect(() => {
    const fetchBanks = async () => {
      const bankSnapshot = await getDocs(collection(db, "banks"));
      const bankNames = bankSnapshot.docs.map((doc) => doc.id);
      setBanks(bankNames);
      if (bankNames.length > 0) setSelectedBank(bankNames[0]);
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedBank) return;
      const ref = bankRef(selectedBank);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setDescriptionSettings(snap.data());
      } else {
        await setDoc(ref, {});
        setDescriptionSettings({});
      }
    };

    fetchSettings();
  }, [selectedBank]);

  const handleToggleRemoval = async (label) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        enabled: !descriptionSettings[label]?.enabled,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleToggleDeletion = async (label) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        deletion: !descriptionSettings[label]?.deletion,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleRegexChange = async (label, newPattern) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        pattern: newPattern,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleAddSetting = async () => {
    if (!newLabel || !newRegex) return;
    const updated = {
      ...descriptionSettings,
      [newLabel]: { enabled: false, deletion: false, pattern: newRegex },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [newLabel]: { enabled: false, deletion: false, pattern: newRegex },
    });
    setNewLabel("");
    setNewRegex("");
  };

  // DELETES THE LINE ADDED 🗑️
  const handleDeleteEntry = async (label) => {
    const updated = { ...descriptionSettings };
    delete updated[label];
    setDescriptionSettings(updated);

    const ref = bankRef(selectedBank);
    await updateDoc(ref, {
      [label]: deleteField(),
    });
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Description Extraction Settings</h3>

      <select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800 text-white border border-gray-700"
      >
        {banks.map((bank) => (
          <option key={bank} value={bank}>{bank}</option>
        ))}
      </select>

      <div className="space-y-3">
        {Object.entries(descriptionSettings).map(([label, data]) => (
          <div key={label} className="border-b border-gray-700 pb-2 mb-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <div className="flex items-center space-x-2">

                <button
                  onClick={() => handleDeleteEntry(label)}
                  className="text-red-500 hover:text-red-700 text-lg"
                  title="Delete this setting"
                >
                  🗑️
                </button>


                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!data?.enabled}
                    onChange={() => handleToggleRemoval(label)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>

                {/* Toggle for deleting regex handleToggleDelete */}
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!data?.deletion}
                    onChange={() => handleToggleDeletion(label)}  // This handles removing matching lines and dont save them to decs 2 please 
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-red-500 relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>

              </div>
            </div>
            <input
              type="text"
              value={data.pattern || ""}
              onChange={(e) => handleRegexChange(label, e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Regex pattern"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">Add New Extraction Rule</h4>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label (e.g., Reference Code)"
          className="w-full p-2 mb-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="text"
          value={newRegex}
          onChange={(e) => setNewRegex(e.target.value)}
          placeholder="Regex Pattern"
          className="w-full p-2 mb-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={handleAddSetting}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Setting
        </button>
      </div>
    </div>
  );
};

export default ExtractDescriptionView3;
