import React from "react";

const BudgetSummaryView1 = ({ 
  incomeTotal = 0, 
  savingsTotal = 0, 
  housingTotal = 0, 
  transportationTotal = 0, 
  expensesTotal = 0, 
  debtTotal = 0 
}) => {
  const totalExpenses = savingsTotal + housingTotal + transportationTotal + expensesTotal + debtTotal;
  const disposableIncome = incomeTotal - totalExpenses;

  const getRangePercentage = (amount) => (incomeTotal > 0 ? ((amount / incomeTotal) * 100).toFixed(2) : "0.00");
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
              <th className="p-2 border border-gray-600">Amount You Can Spend</th>
              <th className="p-2 border border-gray-600">Your Range</th>
              <th className="p-2 border border-gray-600">Amount You Are Spending</th>
              <th className="p-2 border border-gray-600">In / Out of Range</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "SAVINGS", range: 10, amount: savingsTotal },
              { name: "HOUSING", range: 30, amount: housingTotal },
              { name: "TRANSPORTATION", range: 10, amount: transportationTotal },
              { name: "EXPENSES", range: 20, amount: expensesTotal },
              { name: "DEBT", range: 10, amount: debtTotal },
            ].map((item, index) => {
              const allowedAmount = (incomeTotal * (item.range / 100)).toFixed(2);
              const yourRange = getRangePercentage(item.amount);

              return (
                <tr key={index} className="border border-gray-600">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.range}%</td>
                  <td className="p-2">R {allowedAmount}</td>
                  <td className="p-2">{yourRange}%</td>
                  <td className="p-2">R {item.amount.toFixed(2)}</td>
                  <td className={`p-2 font-bold ${isOutOfRange(item.amount, allowedAmount) === "YES" ? "text-red-500" : "text-green-500"}`}>
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
          <span className="font-semibold text-green-400">R {incomeTotal.toFixed(2)}</span>
        </div>

        <h3 className="mt-4">Minus:</h3>
        <div className="space-y-2">
          {[
            { name: "SAVINGS", amount: savingsTotal },
            { name: "HOUSING", amount: housingTotal },
            { name: "TRANSPORTATION", amount: transportationTotal },
            { name: "EXPENSES", amount: expensesTotal },
            { name: "DEBT", amount: debtTotal },
          ].map((item, index) => (
            <div key={index} className="flex justify-between bg-gray-700 p-2 rounded">
              <span>{item.name}</span>
              <span className="font-semibold text-red-400">R {item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-lg font-bold mt-6 bg-gray-800 p-4 rounded-lg text-center">
        <h3 className="text-xl mb-2 text-green-400">TOTAL DISPOSABLE CASH LEFT</h3>
        <div className="bg-gray-700 p-3 rounded flex justify-between">
          <span>Remaining Balance</span>
          <span className={`font-semibold ${disposableIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
            R {disposableIncome.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryView1;
