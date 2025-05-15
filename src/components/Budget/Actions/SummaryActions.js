import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SummaryActions = ({
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
    <div className="p-6 rounded-xl shadow-lg mt-8 text-center bg-gray-900/80 backdrop-blur-md border border-gray-700">
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-center">
        {/* Notes Button with Floating Counter */}
        <div className="relative">
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-600 text-white py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg hover:shadow-purple-500/40"
            onClick={() => setShowNotes(!showNotes)}
          >
            Notes
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={`absolute -top-3 -right-3 ${
              notes.length > 0 ? "bg-red-500" : "bg-gray-600"
            } text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-white/20`}
          >
            {notes.length}
          </motion.div>
        </div>
      </div>

      {/* Notes Section (Fades & Slides In/Out) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-6 rounded-lg shadow-md border border-gray-700 bg-gradient-to-br from-gray-800/90 to-gray-900/80 backdrop-blur-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Client Notes</h2>

            {/* Add Note Input */}
            <div className="mt-3 flex">
              <input
                type="text"
                placeholder="Enter a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              />
              <button
                onClick={() => {
                  if (note.trim()) {
                    handleAddNote();
                  }
                }}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
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
                    className="p-3 bg-gray-800 rounded-md flex justify-between items-center mt-2 border border-gray-700 transition-all hover:bg-gray-700"
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
                className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
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

export default SummaryActions;
