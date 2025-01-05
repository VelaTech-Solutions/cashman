import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions, db, storage } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { listAll } from 'firebase/storage';


const Testclientprofile = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientDoc = doc(db, 'clients', id);
        const clientSnapshot = await getDoc(clientDoc);
        if (clientSnapshot.exists()) {
          setClientData(clientSnapshot.data());
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        setError('Failed to load client data.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);


  useEffect(() => {
    const fetchBankStatement = async () => {
      try {
        console.log(`Fetching files from: bank_statements/${id}/`); // Log folder path
        const folderRef = ref(storage, `bank_statements/${id}/`);
        const fileList = await listAll(folderRef); // List all files
        console.log('Fetched file list:', fileList.items);
  
        const urls = await Promise.all(
          fileList.items.map((item) => getDownloadURL(item)) // Get download URLs
        );
        console.log('File URLs:', urls);
  
        setFileLinks(urls); // Set state for displaying files
      } catch (err) {
        console.error('Error fetching bank statement files:', err);
      }
    };
  
    fetchBankStatement();
  }, [id]);
  
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        console.log(`Fetching client document for ID: ${id}`); // Log the client ID
        const clientDoc = doc(db, 'clients', id);
        console.log(`Document reference:`, clientDoc); // Log the document reference
  
        const clientSnapshot = await getDoc(clientDoc);
        if (clientSnapshot.exists()) {
          console.log('Client data:', clientSnapshot.data()); // Log the client data
          setClientData(clientSnapshot.data());
        } else {
          console.error('Client document not found.');
          setError('Client not found.');
        }
      } catch (err) {
        console.error('Error fetching client data:', err); // Log the error details
        setError('Failed to load client data.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchClientData();
  }, [id]);
  
  
  

  // Handle processing bank statement
  const handleProcessData = async () => {
    setIsProcessing(true);
    try {
      const processBankStatement = httpsCallable(functions, 'processBankStatement');
      const result = await processBankStatement({ clientId: id });
      alert(result.data.message);
    } catch (err) {
      console.error('Error processing data:', err);
      alert('Failed to process data.');
    } finally {
      setIsProcessing(false);
    }
  };



  if (loading) return <p>Loading client data and files...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Navigation */}
      <nav className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <Link to="/dashboard" className="text-white hover:text-blue-400 transition">
          Back to Dashboard
        </Link>
        <Link to="/viewclient" className="text-white hover:text-blue-400 transition">
          Back to View Client
        </Link>
      </nav>

      {/* Client Profile */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">Client Profile</h1>
        <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-white">
            {clientData.clientName} {clientData.clientSurname}{clientData.idNumber}
          </h2>
          <p className="text-lg text-gray-400 mt-2">
            <span className="font-bold text-white">ID:</span> {clientData.name}
          </p>
          <p className="text-lg text-gray-400 mt-1">
            <span className="font-bold text-white">Bank:</span> {clientData.bankName}
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="mt-8">
      <h2 className="text-2xl font-semibold">Uploaded Files</h2>
      {fileLinks.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet.</p>
      ) : (
        <ul className="list-disc pl-6">
          {fileLinks.map((link, index) => (
            <li key={index} className="mt-2">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                File {index + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>


      {/* Selected File */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Selected File</h2>
        {selectedFile ? (
          <a
            href={selectedFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View Selected File
          </a>
        ) : (
          <p className="text-gray-400">No file selected yet.</p>
        )}
      </div>


      {/* Process Button */}
      <div className="mt-8">
        <button
          className={`px-6 py-2 rounded-lg ${
            isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isProcessing}
          onClick={handleProcessData}
        >
          {isProcessing ? 'Processing...' : 'Process Bank Statement'}
        </button>
      </div>
    </div>



    





  );
};

export default Testclientprofile;
