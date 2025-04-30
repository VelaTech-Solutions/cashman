// src/components/Transactions/ExtractTransactions/ExtractAutomatic/ExtractAutomatically.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { LoadClientData } from 'components/Common';
import ContainerOverViews from "./Containers/ContainerOverViews";
import ContainerVeiws from "./Containers/ContainerVeiws";
import ContainerActions from "./Containers/ContainerActions";

function ExtractAutomatically() {
  const { id: clientId } = useParams();
  const [bankName, setBankName] = useState("");
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState(null);
  const [extractionStatus, setExtractionStatus] = useState({});
  const [progressData, setProgressData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // // log clientId
  // console.log("Client ID MainPage:", clientId);
  // console.log("Bank Name MainPage:", bankName);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setBankName(clientData.bankName || "Unknown");

      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    const fetchProgress = async () => {
      try {
        const clientRef = doc(db, "clients", clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          const progress = data.extractProgress || {};
          setProgressData(progress);
        }
      } catch (error) {
        console.error("🔥 Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [clientId]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <div className="flex justify-start items-center space-x-4 mb-4">
        <ContainerOverViews 
        transactions={clientData?.transactions || []}
        bankName={bankName} />
      </div>


      {/* Actions Container */}
      <div className="flex justify-start items-center space-x-4 mb-4">
        <ContainerActions
          clientId={clientId}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}

        />
      </div>

      {/* Container with Progress Extract Views */}
      <div className="flex justify-start items-center space-x-4 mb-4">
        <ContainerVeiws 
        progressData={progressData}
        setProgressData={setProgressData}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        extractionStatus={extractionStatus}
        setExtractionStatus={setExtractionStatus}
      />
      </div>

      {/* Mark as Completed Button */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg text-white">
        <h2 className="text-md font-semibold mb-2">Finalize Extraction</h2>
        {progressData.completed ? (
          <p className="text-green-400 font-semibold">✅ Report marked as completed.</p>
        ) : (
          <button
            onClick={async () => {
              try {
                const clientRef = doc(db, "clients", clientId);
                await updateDoc(clientRef, {
                  "progress.extracted": true,
                });
                setProgressData((prev) => ({ ...prev, completed: true }));
              } catch (error) {
                console.error("Error updating completion status:", error);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded"
          >
            ✅ Mark Report as Completed
          </button>
        )}
      </div>
    </div>
  );
}

export default ExtractAutomatically;
