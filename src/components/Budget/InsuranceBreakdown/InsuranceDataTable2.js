import React, { useState } from "react";

const InsuranceDataTable2 = () => {
  const maxRows = 14;

  const createEmptyRows = () =>
    Array(maxRows)
      .fill()
      .map(() => ({ institution: "", type: "", amount: "" }));

  const [cFuneralLifeCover, setCFuneralLifeCover] = useState(createEmptyRows());
  const [cSavingsInvestments, setCSavingsInvestments] = useState(createEmptyRows());
  const [cShortTermInsurance, setCShortTermInsurance] = useState(createEmptyRows());
  const [rFuneralLifeCover, setRFuneralLifeCover] = useState(createEmptyRows());
  const [rSavingsInvestments, setRSavingsInvestments] = useState(createEmptyRows());
  const [rShortTermInsurance, setRShortTermInsurance] = useState(createEmptyRows());

  const handleChange = (setData, index, field, value) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const renderTable = (title, data, setData, type) => {
    const totalAmount = data.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-white border border-gray-600">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold uppercase">{title}</h3>
          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md">{type}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="py-1 px-2 border border-gray-700">Institution</th>
                <th className="py-1 px-2 border border-gray-700">Type</th>
                <th className="py-1 px-2 border border-gray-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-1 px-2 border border-gray-700">
                    <input
                      type="text"
                      value={row.institution}
                      onChange={(e) => handleChange(setData, index, "institution", e.target.value)}
                      className="bg-transparent border-none w-full outline-none text-white"
                    />
                  </td>
                  <td className="py-1 px-2 border border-gray-700">
                    <input
                      type="text"
                      value={row.type}
                      onChange={(e) => handleChange(setData, index, "type", e.target.value)}
                      className="bg-transparent border-none w-full outline-none text-white"
                    />
                  </td>
                  <td className="py-1 px-2 border border-gray-700 text-right">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleChange(setData, index, "amount", e.target.value)}
                      className="bg-transparent border-none w-full outline-none text-white text-right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-800 text-gray-300">
                <td className="py-1 px-2 font-bold border border-gray-700">Total</td>
                <td className="py-1 px-2 border border-gray-700">-</td>
                <td className="py-1 px-2 font-bold border border-gray-700 text-right">R {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-3 gap-4">
        {renderTable("Funeral & Life Cover", cFuneralLifeCover, setCFuneralLifeCover, "Current")}
        {renderTable("Savings & Investments", cSavingsInvestments, setCSavingsInvestments, "Current")}
        {renderTable("Short-Term Insurance", cShortTermInsurance, setCShortTermInsurance, "Current")}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {renderTable("Restructure - Funeral & Life Cover", rFuneralLifeCover, setRFuneralLifeCover, "Restructured")}
        {renderTable("Restructure - Savings & Investments", rSavingsInvestments, setRSavingsInvestments, "Restructured")}
        {renderTable("Restructure - Short-Term Insurance", rShortTermInsurance, setRShortTermInsurance, "Restructured")}
      </div>
    </div>
  );
};

export default InsuranceDataTable2;
