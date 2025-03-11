import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ClientOverview = ({ clients }) => {
  const [totalClients, setTotalClients] = useState(0);
  const [completedReports, setCompletedReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    setTotalClients(clients.length);
    setCompletedReports(clients.filter((client) => client.status === "Completed").length);
    setPendingReports(clients.filter((client) => client.status === "Pending").length);
  }, [clients]);

  return (
    <section className="p-4 flex justify-center">
      <motion.div 
        className="relative bg-black p-6 rounded-xl shadow-xl text-white flex space-x-6 items-stretch border border-gray-700 overflow-hidden w-full max-w-4xl justify-between"
        // Adjust width of the entire overview container if needed
        // Example: w-[full] or w-[90%] for a more compact layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-900 to-gray-700 opacity-20"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        {/* Adjusted Heights for Perfect Alignment */}
        <motion.div 
          className="flex-1 px-5 py-7 bg-opacity-80 backdrop-blur-xl bg-gray-800 rounded-lg shadow-lg text-center border border-blue-500 flex flex-col justify-center h-[140px]"
          animate={{ boxShadow: "0px 0px 20px rgba(0, 0, 255, 0.6)" }}
        >
          <p className="text-sm uppercase tracking-widest text-blue-300">Total Clients</p>
          <p className="text-4xl font-extrabold text-blue-400 leading-none">{totalClients}</p>
        </motion.div>

        <motion.div 
          className="flex-1 px-5 py-7 bg-opacity-80 backdrop-blur-xl bg-gray-800 rounded-lg shadow-lg text-center border border-green-500 flex flex-col justify-center h-[140px]"
          animate={{ boxShadow: "0px 0px 20px rgba(0, 255, 0, 0.6)" }}
        >
          <p className="text-sm uppercase tracking-widest text-green-300">Completed</p>
          <p className="text-4xl font-extrabold text-green-400 leading-none">{completedReports}</p>
        </motion.div>

        <motion.div 
          className="flex-1 px-5 py-7 bg-opacity-80 backdrop-blur-xl bg-gray-800 rounded-lg shadow-lg text-center border border-yellow-500 flex flex-col justify-center h-[140px]"
          animate={{ boxShadow: "0px 0px 20px rgba(255, 255, 0, 0.6)" }}
        >
          <p className="text-sm uppercase tracking-widest text-yellow-300">Pending</p>
          <p className="text-4xl font-extrabold text-yellow-400 leading-none">{pendingReports}</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ClientOverview;
