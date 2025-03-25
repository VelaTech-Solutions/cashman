import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ClientActions4 = ({
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

  return (
    <div className="p-6 rounded-xl shadow-xl bg-gray-900/70 backdrop-blur-lg border border-gray-700">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className="relative bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-400/50"
          >
            {label}
          </Link>
        ))}

        {/* Notes Button */}
        <button
          className="relative bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-purple-400/50"
          onClick={() => setShowNotes(!showNotes)}
        >
          Notes
          {notes.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border border-white/10"
            >
              {notes.length}
            </motion.div>
          )}
        </button>

        {/* Delete Client Button */}
        <button
          className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-red-400/50"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this client?")) {
              handleDeleteClient();
            }
          }}
        >
          Delete
        </button>
      </div>

      {/* Notes Section */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5 p-5 bg-gray-800/80 backdrop-blur-xl rounded-lg shadow-xl border border-gray-700"
          >
            <h2 className="text-lg font-bold text-white">Notes</h2>

            {/* Add Note Input */}
            <div className="mt-3 flex gap-3">
              <input
                type="text"
                placeholder="Enter a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 p-2 text-sm rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              />
              <button
                onClick={() => {
                  if (note.trim()) {
                    handleAddNote();
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-blue-400/50"
              >
                Add
              </button>
            </div>

            {/* Notes List */}
            <ul className="mt-5 max-h-40 overflow-y-auto space-y-2">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-800/90 backdrop-blur-md rounded-lg flex justify-between items-center border border-gray-700 shadow-md"
                  >
                    <span className="text-gray-300 text-sm">{note.content}</span>
                    <button
                      onClick={() => deleteNote(index)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      ❌
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No notes available.</p>
              )}
            </ul>

            {/* Delete All Notes Button */}
            {notes.length > 0 && (
              <button
                onClick={deleteAllNotes}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-red-400/50 w-full"
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

export default ClientActions4;
