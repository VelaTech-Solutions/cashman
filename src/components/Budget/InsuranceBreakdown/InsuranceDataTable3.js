import React, { useState } from "react";

const InsuranceDataTable3 = () => {
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
  const renderTable = (title, data, setData, isRestructured) => {
    const totalAmount = data.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return (
      <div className="bg-gray-900 p-2 rounded-lg shadow-md mb-2 max-w-[500px] mx-auto text-xs">
        <h3 className={`text-white font-semibold text-center ${isRestructured ? 'text-red-400' : 'text-green-400'}`}>{title}</h3>
        <div className="overflow-hidden">
          <table className="w-full border border-gray-700 text-left text-xs">
            <thead>
              <tr className="bg-gray-800 text-white border-b border-gray-600">
                <th className="py-1 px-1 border-r border-gray-600 w-1/2">Institution</th>
                <th className="py-1 px-1 border-r border-gray-600 w-1/3">Type</th>
                <th className="py-1 px-1 border-gray-600 w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-1 px-1 border-r border-gray-600 text-gray-200">
                    <input
                      type="text"
                      value={row.institution}
                      onChange={(e) => handleChange(setData, index, "institution", e.target.value)}
                      className="bg-transparent border border-gray-600 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                    />
                  </td>
                  <td className="py-1 px-1 border-r border-gray-600 text-gray-200">
                    <input
                      type="text"
                      value={row.type}
                      onChange={(e) => handleChange(setData, index, "type", e.target.value)}
                      className="bg-transparent border border-gray-600 px-1 py-0.5 outline-none text-white w-full text-xs rounded"
                    />
                  </td>
                  <td className="py-1 px-1 border-gray-600 text-gray-200 text-right">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleChange(setData, index, "amount", e.target.value)}
                      className="bg-transparent border border-gray-600 px-1 py-0.5 outline-none text-white w-full text-xs text-right rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-gray-800 text-white border-t border-gray-600">
                <td className="py-1 px-1 border-r border-gray-600 font-bold text-xs">Total</td>
                <td className="py-1 px-1 border-r border-gray-600 font-bold text-xs">-</td>
                <td className="py-1 px-1 border-gray-600 font-bold text-xs">R {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-3 gap-2 border border-gray-700 p-2 rounded-lg">
        {renderTable("Funeral & Life Cover", cFuneralLifeCover, setCFuneralLifeCover, false)}
        {renderTable("Savings & Investments", cSavingsInvestments, setCSavingsInvestments, false)}
        {renderTable("Short-Term Insurance", cShortTermInsurance, setCShortTermInsurance, false)}
      </div>

      <div className="grid grid-cols-3 gap-2 border border-gray-700 p-2 rounded-lg mt-4">
        {renderTable("Restructure - Funeral & Life Cover", rFuneralLifeCover, setRFuneralLifeCover, true)}
        {renderTable("Restructure - Savings & Investments", rSavingsInvestments, setRSavingsInvestments, true)}
        {renderTable("Restructure - Short-Term Insurance", rShortTermInsurance, setRShortTermInsurance, true)}
      </div>
    </div>
  );
};

export default InsuranceDataTable3;
