import React, { useState,useEffect } from "react";
import moment from "moment";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

import { 
  LoadClientData,
  loadCategories, 
  LoadSubcategories,
 } from "components/Common";
const BudgetView = ({ clientId }) => {

    const [clientData, setClientData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);

    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  // Load categories subcategories
  useEffect(() => {
  const fetchCats = async () => {
    const cats = await loadCategories(); // assuming this returns [{ name, subcategories }]
    const enriched = cats.map(cat => ({
      ...cat,
      key: cat.name === "Income" ? "credit_amount" : "debit_amount",
      filter: (t) => t.category === cat.name
    }));
    setCategories(enriched);
  };

    fetchCats();
  }, []);


  // // Load subcategories when category changes
  // useEffect(() => {
  //   const fetchSubs = async () => {
  //     if (!category) return;
  //     const subs = await loadSubcategories(category);
  //     setSubcategories(subs);
  //   };
  //   fetchSubs();
  // }, [category]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  
  const calculateBudget = async () => {
    setLoading(true);
    setMessage("");

    let totals = {}, avgs = {};
    categories.forEach(({ name, filter, key }) => {
      const txns = transactions.filter(filter);
      const total = txns.reduce((sum, t) => sum + (parseFloat(t[key]) || 0), 0);
      const monthSet = new Set(txns.map(t => moment(t.date1, ["DD/MM/YYYY"]).format("MMM")));
      const avg = monthSet.size > 0 ? total / monthSet.size : 0;
      totals[name.toLowerCase()] = parseFloat(total.toFixed(2));
      avgs[`${name.toLowerCase()}avg`] = parseFloat(avg.toFixed(2));
    });

    try {
      const ref = doc(db, "clients", clientId);
      await updateDoc(ref, { budgetData: { ...totals, ...avgs, timestamp: new Date().toISOString() } });
      setMessage("✅ Budget calculated & saved successfully!");
    } catch (err) {
      console.error("🔥 Error saving budget:", err);
      setMessage("❌ Failed to save budget.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4">

            {/* dont forget to click this button just state a reminder*/}
      <p>Please click to save Data</p>
      <button
        onClick={calculateBudget}
        className="px-6 py-3 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        disabled={loading}
      >
        {loading ? "Calculating..." : "📊 Calculate & Save Budget"}
      </button>
      {message && <p className="text-center text-lg font-bold text-green-400">{message}</p>}





      {categories.map(({ name, filter, key }) => {
        const rows = transactions.filter(filter).reduce((acc, t) => {
          const m = moment(t.date1, ["DD/MM/YYYY"]).format("MMM");
          const sub = t.subcategory || "Uncategorized";
          if (!acc[sub]) acc[sub] = { total: 0 };
          if (!acc[sub][m]) acc[sub][m] = 0;
          acc[sub][m] += parseFloat(t[key]) || 0;
          acc[sub].total += parseFloat(t[key]) || 0;
          return acc;
        }, {});

        const monthTotals = months.reduce((acc, m) => {
          acc[m] = Object.values(rows).reduce((s, r) => s + (r[m] || 0), 0);
          return acc;
        }, {});

        const grandTotal = Object.values(monthTotals).reduce((s, v) => s + v, 0).toFixed(2);
        const validMonths = Object.values(monthTotals).filter(v => v !== 0);
        const grandAvg = validMonths.length ? (grandTotal / validMonths.length).toFixed(2) : "0.00";

        return (
          <div key={name} className="mb-4 p-2 border border-gray-300 rounded-md text-xs">
            <h3 className="text-lg font-semibold">{name} (Total: R {grandTotal} | Avg: R {grandAvg})</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-2 border border-gray-400 text-left">Subcategory</th>
                    {months.map(m => <th key={m} className="p-2 border border-gray-400 text-center">{m}</th>)}
                    <th className="p-2 border border-gray-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rows).map(([sub, mdata]) => (
                    <tr key={sub} className="border-b border-gray-300">
                      <td className="p-2 border border-gray-400 font-semibold">{sub}</td>
                      {months.map(m => (
                        <td key={m} className="p-2 text-right border border-gray-400">
                          {mdata[m] ? `R ${mdata[m].toFixed(2)}` : "-"}
                        </td>
                      ))}
                      <td className="p-2 text-right font-bold border border-gray-500">R {mdata.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-2 border border-gray-400 font-bold">TOTAL</td>
                    {months.map(m => (
                      <td key={m} className="p-2 text-right border border-gray-400 font-bold">
                        {monthTotals[m] ? `R ${monthTotals[m].toFixed(2)}` : "-"}
                      </td>
                    ))}
                    <td className="p-2 text-right border border-gray-600 font-bold">R {grandTotal}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-400 font-bold">AVERAGE</td>
                    {months.map(m => (
                      <td key={m} className="p-2 text-right border border-gray-400 font-bold">
                        {monthTotals[m] ? `R ${(monthTotals[m] / validMonths.length).toFixed(2)}` : "-"}
                      </td>
                    ))}
                    <td className="p-2 text-right border border-gray-600 font-bold">R {grandAvg}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default BudgetView;
