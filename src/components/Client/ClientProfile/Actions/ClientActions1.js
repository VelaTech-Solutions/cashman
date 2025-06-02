import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ClientActions1 = ({
  actionLinks,
  notes,
  setNote,
  note,
  handleAddNote,
  deleteNote,
  deleteAllNotes,
  handleDeleteClient,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState("");

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8 text-center border border-gray-700">
      <div className="grid grid-cols-1 gap-3 justify-center">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {/* Action Buttons */}
          {/* {actionLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl"
            >
              {label}
            </Link>
          ))} */}

          {/* Notes Button with Speech Bubble */}
          <div className="relative">
            <button
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg hover:shadow-xl"
              onClick={() => setShowNotes(!showNotes)}
            >
              Notes
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`absolute -top-3 -right-3 ${
                notes.length > 0 ? "bg-red-500" : "bg-gray-500"
              } text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}
            >
              {notes.length}
            </motion.div>
          </div>
          {/* Delete Button */}
          <button
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this client?")) {
                handleDeleteClient();
              }
            }}
          >
            Delete Client Data
          </button>
        </div>
      </div>

      {/* Notes Section (Fades In/Out) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-gray-900 rounded-lg shadow-md border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white">Client Notes</h2>

            {/* Add Note Input */}
            <div className="mt-3 flex">
              <input
                type="text"
                placeholder="Enter a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => {
                  if (note.trim()) {
                    handleAddNote();
                  }
                }}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>

            {/* Notes List */}
            <ul className="mt-3 max-h-40 overflow-y-auto text-left">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <li
                    key={index}
                    className="p-2 bg-gray-800 rounded-md flex justify-between items-center mt-2 border border-gray-700"
                  >
                    <span className="text-gray-300">{note.content}</span>
                    <button
                      onClick={() => deleteNote(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ❌
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No notes available.</p>
              )}
            </ul>

            {/* Delete All Notes Button */}
            {notes.length > 0 && (
              <button
                onClick={deleteAllNotes}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Delete All Notes
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientActions1;
