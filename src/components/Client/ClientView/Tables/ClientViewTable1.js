import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { handleDeleteClient } from "components/Client/ClientDelete";

const ClientViewTable1 = ({ sortedClients }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setClients(sortedClients);
  }, [sortedClients]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="mt-8 relative overflow-hidden p-6 bg-black text-white rounded-xl shadow-2xl neon-border"
    >
      <div className="absolute inset-0 pointer-events-none animate-grid" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clients.length === 0 ? (
          <p className="text-center text-lg text-gray-500">No clients found.</p>
        ) : (
          clients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-gray-900 rounded-2xl shadow-2xl hover:shadow-neon transition-all overflow-hidden neon-border"
            >
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <img
                  src={`https://robohash.org/${client.id}.png?size=50x50`}
                  alt="AI Avatar"
                  className="w-12 h-12 rounded-full border-2 border-cyan-400"
                />
                <h3 className="text-xl font-bold text-cyan-400">
                  {client.clientName} {client.clientSurname}
                </h3>
              </div>

              <div className="mt-12 space-y-4">
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Bank:</span> {client.bankName}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Status:</span>
                  <span
                    className={`px-3 py-1 ml-2 rounded-full font-bold ${
                      client.status === "Completed"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-gray-900"
                    }`}
                  >
                    {client.status}
                  </span>
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">ID:</span> {client.id}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Transactions:</span>{" "}
                  {client.number_of_transactions || "No Data"}
                </p>
                {/* created on data point timestamp */}
                <p className="text-sm text-gray-300">
                  <span className="font-bold">Created on:</span>{" "}
                  {client.timestamp?.toDate().toLocaleDateString() || "No Data"}
                </p>

                <p className="text-sm text-gray-300">
                  <span className="font-bold">Created by:</span>{" "}
                  {client.userEmail || "No Data"}
                </p>
              </div>

              <div className="mt-6">
              {/* Insert progress % in the text too */}
                <div className="text-xs text-gray-300 mb-1">
                  Reports Progress:{" "}
                  {client?.progress?.completed
                    ? "100%"
                    : client?.progress?.categorized
                    ? "75%"
                    : client?.progress?.extracted
                    ? "50%"
                    : client?.progress?.captured
                    ? "25%"
                    : "0%"}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${
                        client?.progress?.completed
                          ? "100%"
                          : client?.progress?.categorized
                          ? "75%"
                          : client?.progress?.extracted
                          ? "50%"
                          : client?.progress?.captured
                          ? "25%"
                          : "0%"
                      }`,
                      backgroundColor: `${
                        client?.progress?.completed ? "#4ade80" : "#facc15"
                      }`,
                    }}
                  ></div>
                </div>
              </div>


              <div className="flex justify-between mt-6">
                <Link
                  to={`/client/${client.id}`}
                  className="bg-cyan-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-cyan-600 transition-transform transform hover:scale-110"
                >
                  View Details
                </Link>
                <button
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to delete this client?")
                    ) {
                      handleDeleteClient(client.id).then(() => {
                        setClients((prev) =>
                          prev.filter((c) => c.id !== client.id)
                        );
                      });
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-110"
                >
                  Delete
                </button>
              </div>

              <div className="absolute inset-0 pointer-events-none animate-glow-frame" />
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default ClientViewTable1;
