import React, { useState } from "react";

const InsuranceDataTable4 = () => {
  const maxRows = 14;

  // Function to create empty rows
  const createEmptyRows = () => Array(maxRows).fill().map(() => ({ institution: "", type: "", amount: "" }));

  // State for all tables
  const [cFuneralLifeCover, setCFuneralLifeCover] = useState(createEmptyRows());
  const [cSavingsInvestments, setCSavingsInvestments] = useState(createEmptyRows());
  const [cShortTermInsurance, setCShortTermInsurance] = useState(createEmptyRows());
  const [rFuneralLifeCover, setRFuneralLifeCover] = useState(createEmptyRows());
  const [rSavingsInvestments, setRSavingsInvestments] = useState(createEmptyRows());
  const [rShortTermInsurance, setRShortTermInsurance] = useState(createEmptyRows());

  const handleChange = (setData, index, field, value) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const renderTable = (title, data, setData, isCurrent) => {
    const totalAmount = data.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return (
      <div className={`p-3 rounded-lg shadow-lg ${isCurrent ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}> 
        <h2 className="text-sm text-white font-bold mb-2 uppercase text-center">{title}</h2>
        <div className="overflow-hidden border border-gray-300 rounded-md shadow-md"> 
          <table className="w-full border-collapse text-xs text-white">
            <thead className="bg-black text-white text-[10px]">
              <tr>
                <th className="p-1 border border-gray-400 text-left">Institution</th>
                <th className="p-1 border border-gray-400 text-left">Type</th>
                <th className="p-1 border border-gray-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-500 hover:bg-gray-900 transition">
                  <td className="p-1 border border-gray-400">
                    <input
                      type="text"
                      value={row.institution}
                      onChange={(e) => handleChange(setData, index, "institution", e.target.value)}
                      className="bg-transparent px-1 py-0.5 w-full text-xs outline-none border border-gray-400 rounded-md"
                    />
                  </td>
                  <td className="p-1 border border-gray-400">
                    <input
                      type="text"
                      value={row.type}
                      onChange={(e) => handleChange(setData, index, "type", e.target.value)}
                      className="bg-transparent px-1 py-0.5 w-full text-xs outline-none border border-gray-400 rounded-md"
                    />
                  </td>
                  <td className="p-1 border border-gray-400 text-right">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleChange(setData, index, "amount", e.target.value)}
                      className="bg-transparent px-1 py-0.5 w-full text-xs text-right outline-none border border-gray-400 rounded-md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-black text-white">
                <td className="p-1 border border-gray-400 font-bold">Total</td>
                <td className="p-1 border border-gray-400 font-bold">-</td>
                <td className="p-1 border border-gray-400 font-bold text-right">R {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white space-y-6">
      {/* Current Insurance */}
      <div className="grid grid-cols-3 gap-3">
        {renderTable("Funeral & Life Cover", cFuneralLifeCover, setCFuneralLifeCover, true)}
        {renderTable("Savings & Investments", cSavingsInvestments, setCSavingsInvestments, true)}
        {renderTable("Short-Term Insurance", cShortTermInsurance, setCShortTermInsurance, true)}
      </div>
      {/* Restructured Insurance */}
      <div className="grid grid-cols-3 gap-3">
        {renderTable("Restructure - Funeral & Life Cover", rFuneralLifeCover, setRFuneralLifeCover, false)}
        {renderTable("Restructure - Savings & Investments", rSavingsInvestments, setRSavingsInvestments, false)}
        {renderTable("Restructure - Short-Term Insurance", rShortTermInsurance, setRShortTermInsurance, false)}
      </div>
    </div>
  );
};

export default InsuranceDataTable4;
