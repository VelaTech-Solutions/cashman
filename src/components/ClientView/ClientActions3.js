import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ClientActions3 = ({
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
    <div className="p-4 rounded-lg shadow-md bg-gray-900/90 backdrop-blur-md border border-gray-700">
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {/* Action Buttons (Smaller & Compact) */}
        {actionLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className="relative bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          >
            {label}
          </Link>
        ))}

        {/* Notes Button with Smaller Floating Counter */}
        <div className="relative">
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
            onClick={() => setShowNotes(!showNotes)}
          >
            Notes
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={`absolute -top-2 -right-2 ${
              notes.length > 0 ? "bg-red-500" : "bg-gray-600"
            } text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/10`}
          >
            {notes.length}
          </motion.div>
        </div>

        {/* Delete Button */}
        <button
          className="bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-4 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this client?")) {
              handleDeleteClient();
            }
          }}
        >
          Delete
        </button>
      </div>

      {/* Notes Section (Compact & Responsive) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-gray-800 rounded-md shadow-md border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>

            {/* Add Note Input */}
            <div className="mt-2 flex">
              <input
                type="text"
                placeholder="Enter a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 p-1 text-sm rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              />
              <button
                onClick={() => {
                  if (note.trim()) {
                    handleAddNote();
                  }
                }}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-md"
              >
                Add
              </button>
            </div>

            {/* Notes List (Smaller Font) */}
            <ul className="mt-2 max-h-32 overflow-y-auto text-left text-xs">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <li
                    key={index}
                    className="p-2 bg-gray-700 rounded-md flex justify-between items-center mt-1 border border-gray-600"
                  >
                    <span className="text-gray-300">{note.content}</span>
                    <button
                      onClick={() => deleteNote(index)}
                      className="text-red-400 hover:text-red-600 text-xs"
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
                className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md shadow-md"
              >
                Delete All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientActions3;
