// src/components/Settings/ExtractSettings/Views/ExtractAlignmentView2.js
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

const defaultAlignmentSettings = {
  "Absa Bank": false,
  "Capitec Bank": false,
  "Fnb Bank": false,
  "Ned Bank": false,
  "Standard Bank": false,
  "Tyme Bank": false,
};

const orderedBanks = Object.keys(defaultAlignmentSettings);

const ExtractAlignmentView2 = () => {
  const [alignmentSettings, setAlignmentSettings] = useState({});

  useEffect(() => {
    const fetchOrCreateSettings = async () => {
      const ref = doc(db, "settings", "alignment");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, defaultAlignmentSettings);
        setAlignmentSettings(defaultAlignmentSettings);
      } else {
        setAlignmentSettings(snap.data());
      }
    };

    fetchOrCreateSettings();
  }, []);

  const handleToggle = async (bank) => {
    const updated = {
      ...alignmentSettings,
      [bank]: !alignmentSettings[bank],
    };

    setAlignmentSettings(updated);
    await updateDoc(doc(db, "settings", "alignment"), updated);
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Alignment Settings</h3>
      <div className="space-y-3">
        {orderedBanks.map((bank) => (
          <div
            key={bank}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
            <span>{bank}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alignmentSettings[bank] || false}
                onChange={() => handleToggle(bank)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractAlignmentView2;
