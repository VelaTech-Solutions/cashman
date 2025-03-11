import React from "react";
import { Link } from "react-router-dom";

function ClientViewTable1({ sortedClients = [] }) {
  if (sortedClients.length === 0) {
    return <p className="text-center text-lg text-gray-500">No clients found.</p>;
  }

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClients.map((client) => (
          <div
            key={client.id}
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
          >
            <h3 className="text-xl font-bold text-blue-400">
              {client.clientName} {client.clientSurname}
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              <span className="font-bold">ID:</span> {client.id}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-bold">Bank:</span> {client.bankName}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-bold">Status:</span> {client.status}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-bold">Date Created:</span>{" "}
              {client.dateCreated}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-bold">Transactions:</span>{" "}
              {client.number_of_transactions > 0
                ? client.number_of_transactions
                : "Extract Transactions"}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-bold">Captured By:</span> {client.userEmail}
            </p>
            <Link
              to={`/client/${client.id}`}
              className="mt-4 inline-block text-blue-400 hover:underline text-sm font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClientViewTable1;
