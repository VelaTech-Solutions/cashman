import React, { useState } from "react";

const InsuranceDataTable1 = () => {
  const maxRows = 14;

  // Function to create initial empty rows
  const createEmptyRows = () => Array(maxRows).fill().map(() => ({ institution: "", type: "", amount: "" }));

  // State for each table
  const [cFuneralLifeCover, setCFuneralLifeCover] = useState(createEmptyRows());
  const [cSavingsInvestments, setCSavingsInvestments] = useState(createEmptyRows());
  const [cShortTermInsurance, setCShortTermInsurance] = useState(createEmptyRows());
  const [rFuneralLifeCover, setRFuneralLifeCover] = useState(createEmptyRows());
  const [rSavingsInvestments, setRSavingsInvestments] = useState(createEmptyRows());
  const [rShortTermInsurance, setRShortTermInsurance] = useState(createEmptyRows());

  // Function to handle input changes
  const handleChange = (setData, index, field, value) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // Function to generate a table component
  const renderTable = (title, data, setData, category) => {
    const totalAmount = data.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return (
      <div className="bg-gray-800 p-2 rounded-lg shadow-md mb-3 max-w-[550px] mx-auto text-xs">
        <h3 className="text-white font-semibold text-center bg-gray-700 py-1 rounded-t-lg">
          {title} <span className="text-gray-300">({category})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-600 text-left text-xs">
            <thead>
              <tr className="bg-gray-700 text-white border-b border-gray-600">
                <th className="py-0.5 px-2 border-r border-gray-600 w-1/2">Institution</th>
                <th className="py-0.5 px-2 border-r border-gray-600 w-1/3">Type</th>
                <th className="py-0.5 px-2 border-gray-600 w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-600 last:border-b-0">
                  <td className="py-0.5 px-2 border-r border-gray-600 text-gray-200">
                    <input
                      type="text"
                      value={row.institution}
                      onChange={(e) => handleChange(setData, index, "institution", e.target.value)}
                      className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                    />
                  </td>
                  <td className="py-0.5 px-2 border-r border-gray-600 text-gray-200">
                    <input
                      type="text"
                      value={row.type}
                      onChange={(e) => handleChange(setData, index, "type", e.target.value)}
                      className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                    />
                  </td>
                  <td className="py-0.5 px-2 border-gray-600 text-gray-200 text-right">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleChange(setData, index, "amount", e.target.value)}
                      className="bg-transparent border border-gray-500 px-1 py-0.5 outline-none text-white w-full text-xs text-right rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-700 text-white border-t border-gray-600">
                <td className="py-0.5 px-2 border-r border-gray-600 font-bold text-xs">Total</td>
                <td className="py-0.5 px-2 border-r border-gray-600 font-bold text-xs">-</td>
                <td className="py-0.5 px-2 border-gray-600 font-bold text-xs">R {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 text-xs">

      {/* 🔹 Current Insurance Tables */}
      <h3 className="text-white font-semibold text-center bg-blue-600 py-1 mb-2 rounded">Current Insurance</h3>
      <div className="grid grid-cols-3 gap-2 border border-gray-700 p-2 rounded-lg">
        {renderTable("Funeral & Life Cover", cFuneralLifeCover, setCFuneralLifeCover, "Current")}
        {renderTable("Savings & Investments", cSavingsInvestments, setCSavingsInvestments, "Current")}
        {renderTable("Short-Term Insurance", cShortTermInsurance, setCShortTermInsurance, "Current")}
      </div>

      {/* 🔹 Restructure Insurance Tables */}
      <h3 className="text-white font-semibold text-center bg-purple-600 py-1 my-2 rounded">Restructure Insurance</h3>
      <div className="grid grid-cols-3 gap-2 border border-gray-700 p-2 rounded-lg">
        {renderTable("Funeral & Life Cover", rFuneralLifeCover, setRFuneralLifeCover, "Restructured")}
        {renderTable("Savings & Investments", rSavingsInvestments, setRSavingsInvestments, "Restructured")}
        {renderTable("Short-Term Insurance", rShortTermInsurance, setRShortTermInsurance, "Restructured")}
      </div>
    </div>
  );
};

export default InsuranceDataTable1;
