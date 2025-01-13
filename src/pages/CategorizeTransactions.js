import React from "react";

const BackButtonPage = ({ CategorizeTransactions }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6">{CategorizeTransactions}</h1>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        Back to Client Profile
      </button>
    </div>
  );
};

export default BackButtonPage;
