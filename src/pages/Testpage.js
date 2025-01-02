import React, { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

const TestPage = () => {
  const [idNumber, setIdNumber] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    if (!idNumber.trim()) {
      setResponse("Please enter a valid ID number.");
      return;
    }

    try {
      const docRef = doc(db, "testCollection", idNumber);
      const data = { timestamp: new Date(), note: "Test entry" };

      // Write the ID number to Firestore
      await setDoc(docRef, data);
      setResponse(`ID number ${idNumber} added successfully.`);

      // Retrieve and display the document to confirm it exists
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error writing ID number:", error);
      setResponse("Failed to add ID number. Check the console for details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <div className="p-8 rounded shadow-lg bg-gray-900 space-y-4">
        <h2 className="text-2xl font-bold">Test Firestore Entry</h2>
        <input
          type="text"
          placeholder="Enter ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
        />
        <button
          onClick={handleSubmit}
          className="w-full p-2 bg-green-600 rounded hover:bg-green-700"
        >
          Submit ID Number
        </button>
        {response && <p className="mt-4 text-green-400">{response}</p>}
      </div>
    </div>
  );
};

export default TestPage;
