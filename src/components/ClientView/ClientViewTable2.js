import React from "react";

const ClientViewTable2 = ({ sortedClients }) => {
  return (
    <section className="mt-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">
          Client List View
        </h2>

        {sortedClients.length === 0 ? (
          <p className="text-center text-lg text-gray-500">No clients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-gray-900 text-white">
              <thead>
                <tr className="bg-gray-700 text-left text-gray-300">
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Bank</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className={`border-t border-gray-700 ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    }`}
                  >
                    <td className="p-3">{client.clientName} {client.clientSurname}</td>
                    <td className="p-3">{client.bankName}</td>
                    <td className="p-3">{client.status}</td>
                    <td className="p-3">{client.id}</td>
                    <td className="p-3">
                      <a
                        href={`/client/${client.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientViewTable2;
