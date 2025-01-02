import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

const TestPage = () => {
  const [idNumber, setIdNumber] = useState(""); // State for ID input
  const [statusMessage, setStatusMessage] = useState(""); // State for status messages

  const handleSubmitId = async () => {
    if (!idNumber.trim()) {
      setStatusMessage("Please enter a valid ID number.");
      return;
    }

    try {
      const idDocRef = doc(db, "clients", idNumber); // Reference to the Firestore document
      await setDoc(idDocRef, {
        idNumber,
        timestamp: new Date().toISOString(),
      });
      setStatusMessage(`ID Number ${idNumber} successfully saved to Firestore!`);
      setIdNumber(""); // Clear input field
    } catch (error) {
      console.error("Error writing to Firestore:", error);
      setStatusMessage(`Failed to save ID number. Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Firestore Integration</h1>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="idNumber">Enter ID Number:</label>
        <input
          type="text"
          id="idNumber"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="ID Number"
          style={{ marginLeft: "10px", padding: "5px" }}
        />
        <button
          onClick={handleSubmitId}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Submit ID Number
        </button>
      </div>
      {statusMessage && (
        <div
          style={{
            marginTop: "20px",
            color: statusMessage.includes("Failed") ? "red" : "green",
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default TestPage;
