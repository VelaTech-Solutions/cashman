import React, { useState } from "react";
import { Link } from "react-router-dom";

const ClientViewTable3 = ({ sortedClients }) => {
  const [expandedClient, setExpandedClient] = useState(null);

  return (
    <section className="mt-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">
          Interactive Client Table
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedClients.length === 0 ? (
            <p className="text-center text-lg text-gray-500">No clients found.</p>
          ) : (
            sortedClients.map((client) => (
              <div
                key={client.id}
                className="relative bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
              >
                {/* Main Card Info */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-blue-400">
                    {client.clientName} {client.clientSurname}
                  </h3>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      client.status === "Completed"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-gray-900"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  <span className="font-bold">Bank:</span> {client.bankName}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="font-bold">ID:</span> {client.id}
                </p>

                {/* Expandable Section */}
                {expandedClient === client.id && (
                  <div className="mt-4 p-4 bg-gray-700 rounded-lg transition-all duration-300">
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">Date Created:</span> {client.dateCreated}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">Transactions:</span>{" "}
                      {client.number_of_transactions > 0
                        ? client.number_of_transactions
                        : "No transactions available"}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">Captured By:</span> {client.userEmail}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-3">
                      <Link
                        to={`/client/${client.id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                      >
                        View Details
                      </Link>
                      <button
                        className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ClientViewTable3;
