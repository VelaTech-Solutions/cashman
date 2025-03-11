import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ClientViewTable4 = ({ sortedClients }) => {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="mt-8 relative overflow-hidden p-6 bg-black text-white rounded-xl shadow-2xl neon-border"
    >
      {/* Glowing Grid Background */}
      <div className="absolute inset-0 pointer-events-none animate-grid" />

      {/* Toggle Dark Mode */}
      {/* <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-800 transition-transform transform hover:scale-105"
        >
          {darkMode ? "💡 Classic Mode" : "🕶️ Cyber Mode"}
        </button>
      </div> */}

      {/* Title */}
      {/* <h2 className="text-4xl font-extrabold text-cyan-400 mb-6 text-center tracking-widest uppercase animate-glitch">
        Neo-Data Client Hub
      </h2> */}

      {/* Holographic Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedClients.length === 0 ? (
          <p className="text-center text-lg text-gray-500">No clients found.</p>
        ) : (
          sortedClients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-gray-900 rounded-2xl shadow-2xl hover:shadow-neon transition-all overflow-hidden neon-border"
            >
              {/* Floating Name & Avatar */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <img
                  src={`https://robohash.org/${client.id}.png?size=50x50`}
                  alt="AI Avatar"
                  className="w-12 h-12 rounded-full border-2 border-cyan-400"
                />
                <h3 className="text-xl font-bold text-cyan-400">{client.clientName} {client.clientSurname}</h3>
              </div>

              {/* Animated Data Blocks */}
              <div className="mt-12 space-y-4">
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Bank:</span> {client.bankName}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Status:</span>
                  <span className={`px-3 py-1 ml-2 rounded-full font-bold ${client.status === "Completed" ? "bg-green-500 text-white" : "bg-yellow-500 text-gray-900"}`}>
                    {client.status}
                  </span>
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">ID:</span> {client.id}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Transactions:</span> {client.number_of_transactions || "No Data"}
                </p>
              </div>

              {/* Live Status Bar */}
              <div className="mt-6">
                <div className="text-xs text-gray-300">Reports Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className={`h-2.5 rounded-full ${client.status === "Completed" ? "bg-green-400" : "bg-yellow-400"}`}
                    style={{ width: `${client.status === "Completed" ? "100%" : "50%"}` }}
                  ></div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-6">
                <Link
                  to={`/client/${client.id}`}
                  className="bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-600 transition-transform transform hover:scale-110"
                >
                  View Details
                </Link>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                >
                  Delete
                </button>
              </div>

              {/* Glowing Frame Effect */}
              <div className="absolute inset-0 pointer-events-none animate-glow-frame" />
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default ClientViewTable4;
