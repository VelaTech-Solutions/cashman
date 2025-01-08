import React, { useEffect, useState } from 'react';
import { BrowserRouter , Routes, Route, useParams, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import '../styles/tailwind.css';

// firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 
import { httpsCallable } from 'firebase/functions';
import { functions, db, storage } from '../firebase/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

const Clientprofile = () => {
   const { id } = useParams();
   const [clientData, setClientData] = useState(null);
   const [fileLinks, setFileLinks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState('');
   const [selectedFile, setSelectedFile] = useState(null);
   const [note, setNote] = useState(''); // State for the new note
   const [notes, setNotes] = useState([]); // State for notes history
   const [userEmail, setUserEmail] = useState('Not logged in');
   const [sidebarOpen, setSidebarOpen] = useState(false);
 
   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
       if (user) {
         setUserEmail(user.email);
       } else {
         setUserEmail('Not logged in');
       }
     });
     return () => unsubscribe();
   }, []);
 
   // Fetch client data with notes
   useEffect(() => {
     const fetchClientNotes = async () => {
       try {
         const clientRef = doc(db, 'clients', id);
         const clientSnapshot = await getDoc(clientRef);
 
         if (clientSnapshot.exists()) {
           const clientData = clientSnapshot.data();
           setNotes(clientData.notes || []); // Set notes or empty array
         } else {
           setError('Client not found.');
         }
       } catch (err) {
         console.error('Error fetching client notes:', err);
         setError('Failed to load notes.');
       } finally {
         setLoading(false);
       }
     };
 
     fetchClientNotes();
   }, [id]);
 
   // Handle adding a new note
   const handleAddNote = async () => {
     if (!note.trim()) {
       alert('Note cannot be empty.');
       return;
     }
 
     try {
       const clientRef = doc(db, 'clients', id);
       const clientSnapshot = await getDoc(clientRef);
 
       if (clientSnapshot.exists()) {
         const existingNotes = clientSnapshot.data().notes || [];
         const updatedNotes = [
           ...existingNotes,
           { User : userEmail, content: note, timestamp: new Date().toISOString() }, // Add new note
         ];
 
         await updateDoc(clientRef, { notes: updatedNotes }); // Update Firestore document
         setNotes(updatedNotes); // Update local state
         setNote(''); // Clear the input
       }
     } catch (err) {
       console.error('Error adding note:', err);
       alert('Failed to add note.');
     }
   };
 
   // Function to delete a note from a client's notes array
   const deleteNote = async (noteIndex) => {
     try {
       const clientRef = doc(db, 'clients', id);
       const clientSnapshot = await getDoc(clientRef);
 
       if (clientSnapshot.exists()) {
         const existingNotes = clientSnapshot.data().notes || [];
         existingNotes.splice(noteIndex, 1);  // Remove note by index
 
         await updateDoc(clientRef, { notes: existingNotes }); // Update Firestore document
         setNotes(existingNotes); // Update local state
         alert('Note deleted successfully!');
       }
     } catch (error) {
       console.error("Error deleting note: ", error);
       alert("Failed to delete note.");
     }
   };
 
   // Function to delete all notes
   const deleteAllNotes = async () => {
     try {
       // Reference to the specific client document
       const clientRef = doc(db, 'clients', id);
       const clientSnapshot = await getDoc(clientRef);
   
       if (clientSnapshot.exists()) {
         // Get the existing notes from the client's document
         const existingNotes = clientSnapshot.data().notes || [];
   
         // Remove all notes (empty array)
         const updatedNotes = [];
   
         // Update the Firestore document with an empty notes array
         await updateDoc(clientRef, { notes: updatedNotes });
   
         // Optionally update local state
         setNotes(updatedNotes); // Clear the local state
         alert('All notes deleted successfully!');
       }
     } catch (error) {
       console.error('Error deleting all notes:', error);
       alert('Failed to delete all notes.');
     }
   };
   
   
   
   // Function to handle deletion of client data
   const handleDeleteClient = async () => {
     try {
       // Delete client document from Firestore
       await deleteDoc(doc(db, 'clients', id));
 
       // Delete associated files from Storage
       const folderRef = ref(storage, `bank_statements/${id}/`);
       const files = await listAll(folderRef);
       for (const file of files.items) {
         await deleteObject(ref(storage, file.fullPath));
       }
 
       alert('Client and associated data successfully deleted.');
     } catch (err) {
       console.error('Error deleting client data:', err);
       alert('Failed to delete client data. Please try again.');
     }
   };
   useEffect(() => {
     const fetchData = async () => {
       setLoading(true);
       try {
         const clientDoc = doc(db, 'clients', id);
         const clientSnapshot = await getDoc(clientDoc);
 
         if (clientSnapshot.exists()) {
           setClientData(clientSnapshot.data());
           const folderRef = ref(storage, `bank_statements/${id}/`);
           const fileList = await listAll(folderRef);
           const urls = await Promise.all(fileList.items.map((item) => getDownloadURL(item)));
           setFileLinks(urls);
         } else {
           setError('Client not found.');
         }
       } catch (err) {
         console.error('Error fetching data:', err);
         setError('Failed to load client data.');
       } finally {
         setLoading(false);
       }
     };
 
     fetchData();
   }, [id]);
 
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
         <Link to="/dashboard" className="text-white hover:text-blue-400 transition">Back to Dashboard</Link>
         <Link to="/viewclient" className="text-white hover:text-blue-400 transition">Back to View Client</Link>
 </nav>
       {/* Client Profile */}
       <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
         <h1 className="text-4xl font-bold mb-4 text-blue-400">Client Profile</h1>
         <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
           <h2 className="text-2xl font-semibold text-white">
             {clientData.clientName} {clientData.clientSurname}
           </h2>
           <p className="text-lg text-gray-400 mt-2">
             <span className="font-bold text-white">ID:</span> {id}
           </p>
           <p className="text-lg text-gray-400 mt-1">
             <span className="font-bold text-white">Bank:</span> {clientData.bankName}
           </p>
           <p className="text-lg text-gray-400 mt-1">  
             <span className="font-bold text-white">User Capture:</span> {clientData.userEmail}
           </p>
         </div>
       </div>
 
 
     {/* Buttons Stacked Vertically */}
     <div className="flex flex-col gap-2 mt-4">
       {/* Profile Buttons */}
       <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
         Profile
       </button>
       <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
         View Transactions
       </button>
       <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
         Edit Transactions
       </button>
       <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
         Categorize Transactions
       </button>
       <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
         View Reports
       </button>
 
       {/* link with storage and firestore */}
       <div>
       <button
         className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm w-60"
         onClick={() => {
           if (window.confirm('Are you sure you want to delete this client?')) {
             handleDeleteClient();
           }
         }}
       >
         Delete Client Data
       </button>
       </div>
     </div>
 
     {/* Client notes section A box here the user can add note about the client, linked with clients data*/}
     <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
       <h1 className="text-4xl font-bold mb-4 text-blue-400">Client Notes</h1>
       <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
         <h2 className="text-2xl font-semibold text-white">Add a Note</h2>
         <p className="text-lg text-gray-400 mt-2">Write notes about the client here:</p>
 
         {/* Text box for adding a new note */}
         <textarea
           className="w-full h-32 p-2 mt-4 bg-gray-700 text-white rounded-lg"
           placeholder="Enter notes..."
           value={note}
           onChange={(e) => setNote(e.target.value)}
         ></textarea>
 
         {/* Notes Buttons */}
         <div className="flex gap-2 mt-4">
           {/* Add Note Button */}
           <button
             className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl"
             onClick={handleAddNote}
           >
             Save Note
           </button>
 
           {/* Delete All Notes */}
           <button
             onClick={deleteAllNotes}
             className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl"
           >
             Delete All Notes
           </button>
         </div>
 
 
         {/* Notes History */}
         <h2 className="text-2xl font-semibold text-white mt-4 border-t border-gray-700 pt-2">Notes History</h2>
         {loading ? (
           <p className="text-lg text-gray-400">Loading notes...</p>
         ) : notes.length > 0 ? (
           <ul className="list-disc pl-6">
             {notes.map((note, index) => (
               <li key={index} className="text-lg text-gray-400 mt-2">
                 <p>Created by: <strong>{note.User}</strong></p>
                 {note.content} <br />
                 <span className="text-sm text-gray-500">Added: {new Date(note.timestamp).toLocaleString()} </span>
                 <button onClick={() => deleteNote(index)} className="text-red-500">Delete</button>
 
 
               </li>
             ))}
           </ul>
         ) : (
           <p className="text-lg text-gray-400">No notes found.</p>
         )}
 
         {/* Error Message */}
         {error && <p className="text-red-500">{error}</p>}
       </div>
     </div>
   </div>
   );
 };
export default Clientprofile;
