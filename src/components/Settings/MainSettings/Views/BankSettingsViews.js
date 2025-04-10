import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

const BankSettingsViews = () => {
  const [bankName, setBankName] = useState(""); // State to store the bank name
  const [banks, setBanks] = useState([]); // State to store the list of banks
  const [error, setError] = useState(""); // For error handling

  const handleChange = (e) => {
    setBankName(e.target.value); // Update state when the input changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (bankName.trim() === "") {
      setError("Bank name cannot be empty");
      return;
    }

    try {
      // Reference to the 'banks' collection inside the 'settings' document
      const settingsRef = doc(db, "settings", "banks");

      // Check if the 'banks' field exists in the settings document
      const docSnap = await getDoc(settingsRef);
      
      if (!docSnap.exists()) {
        // If the collection doesn't exist, create it and add the first bank name
        await setDoc(settingsRef, {
          banks: [bankName], // Create the 'banks' field as an array and add the first bank
        });

        //   // Update the state with the new list of banks
        // setBanks([bankName]); // Store the new bank name in the state

        alert("Bank added successfully!");
      } else {
        // If the collection exists, just add the bank name to the existing list
        const existingBanks = docSnap.data().banks || [];
        existingBanks.push(bankName);

        // Update the 'banks' field with the new bank name
        await setDoc(settingsRef, { banks: existingBanks });


        // Update the state
        setBanks([...existingBanks]); 
        alert("Bank added successfully!");
      }

      setBankName(""); // Clear the input field
      setError(""); // Clear error message

    } catch (error) {
      console.error("Error adding bank: ", error);
      setError("Error adding bank");
    }
  };

  const handleDelete = async (bankNameToDelete) => {
    try {
      // Reference to the 'banks' collection inside the 'settings' document
      const settingsRef = doc(db, "settings", "banks");

      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const existingBanks = docSnap.data().banks || [];

        // Remove the bank from the list
        const updatedBanks = existingBanks.filter((bank) => bank !== bankNameToDelete);

        // Update Firestore with the new list of banks
        await setDoc(settingsRef, { banks: updatedBanks });

        // Update the state with the new list of banks
        setBanks(updatedBanks);
        

        alert("Bank deleted successfully!");
      } else {
        alert("No banks found to delete");
      }

    } catch (error) {
      console.error("Error deleting bank: ", error);
      alert("Error deleting bank");
    }
  };

  // Fetch the bank names from Firestore when the component mounts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // Reference to the 'settings' document
        const settingsRef = doc(db, "settings", "banks");
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const bankList = docSnap.data().banks || []; // Retrieve the banks array
          setBanks(bankList); // Store the bank names in the state
        }
      } catch (error) {
        console.error("Error fetching banks: ", error);
      }
    };

    fetchBanks(); // Call the fetch function
  }, []); // The empty dependency array ensures this effect only runs once when the component mounts

  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Bank Settings</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-300">Bank Name</label>
          <input
            type="text"
            value={bankName} // Set the value of the input to the state
            onChange={handleChange} // Call handleChange when input changes
            placeholder="Enter your bank name"
            className="w-full px-3 py-2 border border-gray-600 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
          >
            Add Bank
          </button>
        </div>

      </form>

      {/* Display the banks */}
      <div className="space-y-3 mt-4">
        {banks.length > 0 ? (
          banks.map((bank, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded flex justify-between items-center">
              <span>{bank}</span>
              <button
                onClick={() => handleDelete(bank)}
                className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No banks available</p> // If no banks exist in the collection
        )}
      </div>
    </div>
  );
};

export default BankSettingsViews;
