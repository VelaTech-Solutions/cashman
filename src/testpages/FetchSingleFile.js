import React, { useState } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

const FetchSingleFile = () => {
  const [id, setId] = useState(""); // Folder ID
  const [fileUrl, setFileUrl] = useState(""); // File URL
  const [message, setMessage] = useState(""); // Feedback message

  const fetchFile = async () => {
    if (!id) {
      setMessage("Please enter a valid ID.");
      return;
    }

    try {
      const storage = getStorage(); // Initialize Firebase Storage
      const folderPath = `bank_statements/${id}/`; // Folder path
      const folderRef = ref(storage, folderPath);

      // List all files in the folder
      const result = await listAll(folderRef);

      if (result.items.length === 0) {
        setMessage("No files found in the folder.");
        setFileUrl(""); // Clear previous URL
        return;
      }

      // Get the URL of the first file
      const fileRef = result.items[0]; // Assuming there's only one file
      const downloadURL = await getDownloadURL(fileRef);

      setFileUrl(downloadURL);
      setMessage("File retrieved successfully!");
    } catch (error) {
      console.error("Error fetching file:", error);
      setMessage("File not found.");
      setFileUrl("");
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl mb-4">Fetch File from Folder</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Folder ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
      </div>
      <button
        onClick={fetchFile}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        Fetch File
      </button>
      {message && <p className="mt-4 text-lg text-green-500">{message}</p>}
      {fileUrl && (
        <div className="mt-4">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            View File
          </a>
        </div>
      )}
    </div>
  );
};

export default FetchSingleFile;
