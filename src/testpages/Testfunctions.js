import React, { useState } from "react";

const FetchAndSendFile = () => {
  const [id, setId] = useState(""); // Folder ID input
  const [fileUrl, setFileUrl] = useState(""); // File URL fetched from Firebase Storage
  const [bankName, setBankName] = useState(""); // Selected bank
  const [method, setMethod] = useState(""); // User-selected method: OCR or Parser
  const [message, setMessage] = useState(""); // Feedback message
  const [backendResponse, setBackendResponse] = useState(""); // Backend response

  const sendFileToBackend = async () => {
    if (!fileUrl || !bankName || !method) {
      setMessage("Please fill in all fields before sending.");
      return;
    }

    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/process_file",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl, bankName, method }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setBackendResponse(data.message);
        console.log("Extracted Data:", data.data); // Logs extracted text
      } else {
        setBackendResponse(data.error || "Error processing file.");
      }
    } catch (error) {
      console.error("Error sending file to backend:", error);
      setBackendResponse("Error sending file to backend.");
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl mb-4">Fetch and Send File</h1>

      {/* Input Fields */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Folder ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Bank Name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
      </div>

      <div className="mb-4">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        >
          <option value="">Select Method</option>
          <option value="Parser">Parser (Text-based)</option>
          <option value="OCR">OCR (Image-based)</option>
        </select>
      </div>

      {/* Buttons */}
      <button
        onClick={sendFileToBackend}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        Send File to Backend
      </button>

      {/* Feedback Messages */}
      {message && <p className="mt-4 text-yellow-500">{message}</p>}
      {backendResponse && <p className="mt-4 text-green-500">{backendResponse}</p>}
    </div>
  );
};

export default FetchAndSendFile;
