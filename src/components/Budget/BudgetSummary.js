import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { TemplateContext } from "components/TemplateContext"; // Import the global template

import { generateBudgetReport } from "components/Budget/xlsxModule"; // Import XLSXModule function


const SummaryBudget = () => {
  const { id } = useParams();

  const [notes, setNotes] = useState([]); // State for notes history
  const [note, setNote] = useState(""); // For adding a new note
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const db = getFirestore();


  const { templateBlob } = useContext(TemplateContext);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!id) return;
      try {
        const budgetDoc = await getDoc(doc(db, "clients", id, "budget", "summary"));
        if (budgetDoc.exists()) {
          setBudgetData(budgetDoc.data());
  
        }

      } catch (error) {
        console.error("❌ Error fetching budget data:", error);
        setError("Failed to load budget data.");
      }
    };
    fetchBudgetData();
  }, [id, db]);
  

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert("Note cannot be empty.");
      return;
    }

    try {
      const clientRef = doc(db, "clients", id, "budget", "summary");
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        const updatedNotes = [
          ...existingNotes,
          {
            User: "Anonymous", // You can update this later with user info if needed
            content: note,
            timestamp: new Date().toISOString(),
          },
        ];

        await updateDoc(clientRef, { notes: updatedNotes });
        setNotes(updatedNotes);
        setNote("");
      }
    } catch (err) {
      console.error("❌ Error adding note:", err);
      alert("Failed to add note.");
    }
  };

  // Handle deleting a single note
  const deleteNote = async (noteIndex) => {
    try {
      const clientRef = doc(db, "clients", id, "budget", "summary");
      const updatedNotes = notes.filter((_, index) => index !== noteIndex);

      await updateDoc(clientRef, { notes: updatedNotes });
      setNotes(updatedNotes);
      alert("Note deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting note:", error);
      alert("Failed to delete note.");
    }
  };

  // Handle deleting all notes
  const deleteAllNotes = async () => {
    try {
      const clientRef = doc(db, "clients", id, "budget", "summary");

      await updateDoc(clientRef, { notes: [] });
      setNotes([]);
      alert("All notes deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting all notes:", error);
      alert("Failed to delete all notes.");
    }
  };


  if (!budgetData) {
    return <div className="text-white">Loading budget data...</div>;
  }

  const incomeTotal = Math.abs(parseFloat(budgetData.Income?.avgTotal || 0));
  const savingsTotal = Math.abs(parseFloat(budgetData.Savings?.avgTotal || 0));
  const housingTotal = Math.abs(parseFloat(budgetData.Housing?.avgTotal || 0));
  const transportationTotal = Math.abs(parseFloat(budgetData.Transportation?.avgTotal || 0));
  const expensesTotal = Math.abs(parseFloat(budgetData.Expenses?.avgTotal || 0));
  const debtTotal = Math.abs(parseFloat(budgetData.Debt?.avgTotal || 0));

  const getRangePercentage = (amount) => (incomeTotal > 0 ? ((amount / incomeTotal) * 100).toFixed(2) : "0.00");

  const isOutOfRange = (amount, allowed) => (amount > allowed ? "YES" : "NO");

  const totalExpenses = savingsTotal + housingTotal + transportationTotal + expensesTotal + debtTotal;
  const disposableIncome = incomeTotal - totalExpenses;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
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


      {/* Notes Section */}
      <div className="bg-gray-700 p-4 rounded-lg mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-lg font-bold">Client Notes</h3>
          <button
            className="text-blue-400 hover:underline"
            onClick={() => setShowNotes(!showNotes)}
          >
            {showNotes ? "Hide Notes" : "Show Notes"}
          </button>
        </div>

        {showNotes && (
          <div className="mt-4">
            {/* Add Note */}
            <textarea
              className="w-full p-2 bg-gray-800 text-white rounded"
              placeholder="Enter a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex gap-2 mt-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddNote}>
                Add Note
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={deleteAllNotes}>
                Delete All Notes
              </button>
            </div>

            {/* Notes History */}
            <ul className="mt-4">
              {notes.map((n, index) => (
                <li key={index} className="text-white border-b border-gray-600 py-2">
                  <p>{n.content}</p>
                  <span className="text-gray-400 text-sm">
                    {n.timestamp && new Date(n.timestamp).toLocaleString()}
                  </span>
                  <button
                    className="text-red-400 ml-2"
                    onClick={() => deleteNote(index)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </div>

      {/* Download Button */}
      <button onClick={() => generateBudgetReport(id, templateBlob)}>
        Download Budget Report
      </button>


    </div>
  );
};

export default SummaryBudget;
