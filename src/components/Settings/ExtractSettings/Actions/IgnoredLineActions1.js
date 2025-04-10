// src/components/Settings/ExtractSettings/Actions/IgnoredLineActions1.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc,getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// Component Imports
// import { Sidebar } from 'components/Common';

function IgnoredLineActions1() {
  const [ignoredLines, setIgnoredLines] = useState([]);
  const [fuzzyIgnoredLines, setFuzzyIgnoredLines] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedBank, setSelectedBank] = useState(""); // State to track selected bank
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "banks"));
        const bankNames = snapshot.docs.map((doc) => doc.id);
        setBanks(bankNames);
      } catch (err) {
        console.error("Error fetching banks:", err.message);
      }
    };
  
    fetchBanks();
  }, []);
  
  // Fetch ignored lines based on selected bank
  useEffect(() => {
    const fetchIgnoredLines = async () => {
      if (!selectedBank) return;
      try {
        const bankRef = doc(db, "banks", selectedBank);
        const bankSnap = await getDoc(bankRef);
        if (bankSnap.exists()) {
          setIgnoredLines(bankSnap.data().ignoredLines || []);
          setFuzzyIgnoredLines(bankSnap.data().fuzzyIgnoredLines || []);
        } else {
          setIgnoredLines([]);
          setFuzzyIgnoredLines([]);
        }
      } catch (err) {
        console.error("Error fetching ignored lines:", err.message);
        setError("Failed to fetch ignored lines.");
      }
    };
    fetchIgnoredLines();
  }, [selectedBank]);

  // Handle row selection (checkbox toggle)
  const handleToggleRow = (index) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  // add ignored line
  const handleAddIgnoredLine = async () => {
    const newIgnoredLine = document.querySelector("input[type='text']").value.trim();
    if (!newIgnoredLine) return;
    const updatedIgnoredLines = [...ignoredLines, newIgnoredLine];
    try {
      await updateDoc(doc(db, "banks", selectedBank), { ignoredLines: updatedIgnoredLines });
      setIgnoredLines(updatedIgnoredLines);
    } catch (err) {
      console.error("Error updating ignored lines:", err.message);
      setError("Failed to update ignored lines.");
    }
  };

  // Add Fuzzy Ignored Line
  const handleAddFuzzyIgnoredLine = async () => {
    const newFuzzyIgnoredLine = document.querySelector("input[type='text']").value.trim();
    if (!newFuzzyIgnoredLine) return;
    const updatedFuzzyIgnoredLines = [...fuzzyIgnoredLines, newFuzzyIgnoredLine];
    try {
      await updateDoc(doc(db, "banks", selectedBank), { fuzzyIgnoredLines: updatedFuzzyIgnoredLines });
      setFuzzyIgnoredLines(updatedFuzzyIgnoredLines);
    } catch (err) {
      console.error("Error updating fuzzy ignored lines:", err.message);
      setError("Failed to update fuzzy ignored lines.");
    }
  };

  // Handle deleting selected ignored lines
  const handleDeleteIgnoredLines = async () => {
    const updatedIgnoredLines = ignoredLines.filter((_, index) => !selectedRows.has(index));

    try {
      await updateDoc(doc(db, "banks", selectedBank), { ignoredLines: updatedIgnoredLines });
      setIgnoredLines(updatedIgnoredLines);
      setSelectedRows(new Set());
    } catch (err) {
      console.error("Error updating ignored lines:", err.message);
      setError("Failed to update ignored lines.");
    }
  };

  const handleDeleteFuzzyIgnoredLines = async () => {
    const updatedFuzzyIgnoredLines = fuzzyIgnoredLines.filter((_, index) => !selectedRows.has(index));
    try {
    await updateDoc(doc(db, "banks", selectedBank), { fuzzyIgnoredLines: updatedFuzzyIgnoredLines });
    setFuzzyIgnoredLines(updatedFuzzyIgnoredLines);
    setSelectedRows(new Set());
    } catch (err) {
    console.error("Error deleting fuzzy ignored lines:", err.message);
    setError("Failed to delete fuzzy ignored lines.");
    }
    };

  const handleCopyToFuzzyIgnored = async () => {
    const selectedLines = Array.from(selectedRows).map((index) => ignoredLines[index]);
    const updatedFuzzyIgnoredLines = [...new Set([...fuzzyIgnoredLines, ...selectedLines])];
    
    try {
        await updateDoc(doc(db, "banks", selectedBank), {
        fuzzyIgnoredLines: updatedFuzzyIgnoredLines,
        });
        setFuzzyIgnoredLines(updatedFuzzyIgnoredLines);
        setSelectedRows(new Set());
    } catch (err) {
        console.error("Error updating fuzzy ignored lines:", err.message);
        setError("Failed to update fuzzy ignored lines.");
    }
    };

      

return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="relative bg-gray-900 p-6 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Extract Settings</h1>

        {/* Select Bank Dropdown */}
        <div className="mb-4">
          <select
            className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            <option value="">Select Bank</option>
            {banks.map((bankName) => (
              <option key={bankName} value={bankName}>
                {bankName}
              </option>
            ))}
          </select>
        </div>
        {/* input Ignored Line Section */}
        <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Ignored Line</label>
            <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            placeholder="Enter the line to ignore"
            />
        </div>


        {/* input Fuzzy Ignored Line Section */}
        <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Fuzzy Ignored Line</label>
            <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            placeholder="Enter the fuzzy line to ignore"
            />
        </div>
        {/* Add Line Button */}
        <div className="mb-4">
            <Button
            onClick={handleAddIgnoredLine}
            text="Add Ignored Line"
            small
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!selectedBank}
            />

            <Button
            onClick={handleAddFuzzyIgnoredLine}
            text="Add Fuzzy Ignored Line"
            small
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!selectedBank}
            />


        </div>

        {/* Delete Selected Button */}
        <div className="sticky top-0 bg-gray-900 p-2 z-10 flex justify-between border-b border-gray-700">
            <Button
            onClick={handleDeleteIgnoredLines}
            text="Delete Selected"
            small
            className="bg-red-500 hover:bg-red-600"
            disabled={selectedRows.size === 0 || !selectedBank}
            />

            <Button
            onClick={handleCopyToFuzzyIgnored}
            text="Copy to Fuzzy Ignored"
            small
            className="bg-red-500 hover:bg-red-600"
            disabled={selectedRows.size === 0 || !selectedBank}
            />
        </div>
        

        {/* Scrollable Table Section */}
        <div className="max-h-[500px] overflow-y-auto border border-gray-700 rounded-lg p-2">
            <table className="w-full border-collapse border border-gray-700">
            <thead>
                <tr className="bg-gray-800">
                <th className="p-2 border border-gray-600 text-left">Select</th>
                <th className="p-2 border border-gray-600 text-left">Ignored Line</th>
                </tr>
            </thead>
            <tbody>
                {ignoredLines.length > 0 ? (
                ignoredLines.map((ignoredLine, index) => (
                    <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">
                        <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleToggleRow(index)}
                        />
                    </td>
                    <td className="p-2">{ignoredLine}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="2" className="text-center p-4">
                    No ignored lines found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>



        {/* Scrollable Table Section */}
        <div className="max-h-[500px] overflow-y-auto border border-gray-700 rounded-lg p-2 ">

        {/* Delete Selected Button */}
        <div className="flex gap-2 mb-4">
            <Button
            onClick={handleDeleteFuzzyIgnoredLines}
            text="Delete Fuzzy Ignored Lines"
            small
            className="bg-red-500 hover:bg-red-600"
            disabled={selectedRows.size === 0 || !selectedBank}
            />

        </div>

            <table className="w-full border-collapse border border-gray-700">
            <thead>
                <tr className="bg-gray-800">
                <th className="p-2 border border-gray-600 text-left">Select</th>
                <th className="p-2 border border-gray-600 text-left">Fuzzy Ignored Line</th>
                </tr>
            </thead>
            <tbody>
                {fuzzyIgnoredLines.length > 0 ? (
                fuzzyIgnoredLines.map((fuzzyIgnoredLines, index) => (
                    <tr key={index} className="border-b border-gray-700">
                    <td className="p-2">
                        <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleToggleRow(index)}
                        />
                    </td>
                    <td className="p-2">{fuzzyIgnoredLines}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="2" className="text-center p-4">
                    No fuzzy ignored lines found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
    </div>
    );
    };

export default IgnoredLineActions1;
    