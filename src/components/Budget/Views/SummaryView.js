import React from "react";

const SummaryView = ({ budgetData }) => {
  // Default values to avoid `NaN`
  const defaultValues = {
    incomeavg: 0,
    savingsavg: 0,
    housingavg: 0,
    transportavg: 0,
    expensesavg: 0,
    debtavg: 0,
  };

  const {
    incomeavg,
    savingsavg,
    housingavg,
    transportavg,
    expensesavg,
    debtavg,
  } = { ...defaultValues, ...budgetData };

  // Ensure values are properly parsed
  const parseAmount = (amount) => (!isNaN(amount) ? parseFloat(amount) : 0.0);

  const parsedIncome = parseAmount(incomeavg);
  const parsedSavings = parseAmount(savingsavg);
  const parsedHousing = parseAmount(housingavg);
  const parsedTransport = parseAmount(transportavg);
  const parsedExpenses = parseAmount(expensesavg);
  const parsedDebt = parseAmount(debtavg);

  // Calculate total expenses and disposable income
  const totalExpenses = parsedSavings + parsedHousing + parsedTransport + parsedExpenses + parsedDebt;
  const disposableIncome = parsedIncome - totalExpenses;

  // Calculate percentage of total income
  const getRangePercentage = (amount) =>
    parsedIncome > 0 ? ((amount / parsedIncome) * 100).toFixed(2) : "0.00";

  // Check if the spending is above the normal range
  const isOutOfRange = (amount, allowed) => (amount > allowed ? "YES" : "NO");

  return (
    <div>
      <div className="text-white text-lg font-bold mb-4">
        Your current monthly expenditure is
        <span className="text-blue-500 mx-2">out of</span>
        bounds when compared to a financially planned budget.
      </div>

      <p className="text-gray-300 mb-4">
        Your current funds need to be structured for your short, medium, and long-term needs as follows:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-600 text-white">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 border border-gray-600">Category</th>
              <th className="p-2 border border-gray-600">Normal Range</th>
              <th className="p-2 border border-gray-600">Allowed Spending</th>
              <th className="p-2 border border-gray-600">Your %</th>
              <th className="p-2 border border-gray-600">Actual Spending</th>
              <th className="p-2 border border-gray-600">In / Out of Range</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "SAVINGS", range: 10, amount: parsedSavings },
              { name: "HOUSING", range: 30, amount: parsedHousing },
              { name: "TRANSPORTATION", range: 10, amount: parsedTransport },
              { name: "EXPENSES", range: 20, amount: parsedExpenses },
              { name: "DEBT", range: 10, amount: parsedDebt },
            ].map((item, index) => {
              const allowedAmount = (parsedIncome * (item.range / 100)).toFixed(2);
              const yourRange = getRangePercentage(item.amount);

              return (
                <tr key={index} className="border border-gray-600">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.range}%</td>
                  <td className="p-2">R {Number(allowedAmount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  <td className="p-2">{yourRange}%</td>
                  <td className="p-2">R {item.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  <td
                    className={`p-2 font-bold ${
                      isOutOfRange(item.amount, allowedAmount) === "YES"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {isOutOfRange(item.amount, allowedAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-lg font-bold mt-4">
        <h3 className="mb-2">INCOME</h3>
        <div className="bg-gray-700 p-2 rounded flex justify-between">
          <span>Income</span>
          <span className="font-semibold text-green-400">
            R {parsedIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <h3 className="mt-4">Minus:</h3>
        <div className="space-y-2">
          {[{ name: "SAVINGS", amount: parsedSavings },
            { name: "HOUSING", amount: parsedHousing },
            { name: "TRANSPORTATION", amount: parsedTransport },
            { name: "EXPENSES", amount: parsedExpenses },
            { name: "DEBT", amount: parsedDebt }].map((item, index) => (
            <div key={index} className="flex justify-between bg-gray-700 p-2 rounded">
              <span>{item.name}</span>
              <span className="font-semibold text-red-400">
                R {item.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-lg font-bold mt-6 bg-gray-800 p-4 rounded-lg text-center">
        <h3 className="text-xl mb-2 text-green-400">TOTAL DISPOSABLE CASH LEFT</h3>
        <div className="bg-gray-700 p-3 rounded flex justify-between">
          <span>Remaining Balance</span>
          <span
            className={`font-semibold ${
              disposableIncome >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            R {disposableIncome.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
