import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Table from "components/Table"; 

function ViewTransactions() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClientData(data);
          setTransactions(data.transactions || []);
        } else {
          setError("No client data found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, refreshKey]);

  if (loading) return <p className="text-white">Loading transactions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md relative">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">View Structured Transactions</h2>
      </div>

      <Table key={refreshKey}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 border border-gray-600">Date 1</th>
            <th className="p-2 border border-gray-600">Date 2</th>
            <th className="p-2 border border-gray-600">Description</th>
            <th className="p-2 border border-gray-600">Fees Description</th>
            <th className="p-2 border border-gray-600">Fees Type</th>
            <th className="p-2 border border-gray-600">Fees Amount</th>
            <th className="p-2 border border-gray-600">Credit/Debit Amount</th>
            <th className="p-2 border border-gray-600">Credit Amount</th>
            <th className="p-2 border border-gray-600">Debit Amount</th>
            <th className="p-2 border border-gray-600">Balance Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <tr key={index} className="border-b border-gray-700 text-white">
                <td className="p-2 border border-gray-600">{transaction.date1 || "—"}</td>
                <td className="p-2 border border-gray-600">{transaction.date2 || "—"}</td>
                <td className="p-2 border border-gray-600">{transaction.description || "—"}</td>
                <td className="p-2 border border-gray-600">{transaction.fees_description || "—"}</td>
                <td className="p-2 border border-gray-600">{transaction.fees_type || "—"}</td>
                <td className="p-2 border border-gray-600">{transaction.fees_amount || "0.00"}</td>
                <td className="p-2 border border-gray-600">{transaction.credit_debit_amount || "0.00"}</td>
                <td className="p-2 border border-gray-600">{transaction.credit_amount || "0.00"}</td>
                <td className="p-2 border border-gray-600">{transaction.debit_amount || "0.00"}</td>
                <td className="p-2 border border-gray-600">{transaction.balance_amount || "0.00"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-400">
                No transactions available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ViewTransactions;
