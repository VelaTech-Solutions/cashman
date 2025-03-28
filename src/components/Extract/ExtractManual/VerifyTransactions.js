import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase Imports
import { doc, getDoc, updateDoc, setDoc, or } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Components Imports
import { LoadClientData, Button, Table } from 'components/Common';
import BankCleanRules from "../../Rules/BankCleanRules";



function VerifyTransactions() {
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

  const handleVerifyTransactions = async () => {
    let transactionCount = 0; // 🔹 Counter for number of processed transactions
  
    let updatedTransactions = transactions.map((transaction, index) => {
      let verified = true; // 🔹 Assume valid unless an issue is found
  
      // 🔹 (1) Extract relevant values
      let { date1, date2, credit_debit_amount, credit_amount, debit_amount, balance_amount } = transaction;
  
      // 🔹 (2) Ensure dates are properly formatted
      date1 = formatDate(date1);
      date2 = formatDate(date2);
  
      // 🔹 (3) Verify balance exists
      if (!balance_amount || isNaN(parseFloat(balance_amount))) {
        verified = false; // 🔹 Missing balance, cannot verify
      }
  
      // 🔹 (4) Ensure credit_debit_amount is a valid number or array
      let amounts = [];
      if (typeof credit_debit_amount === "string") {
        amounts = credit_debit_amount.split(" ").map(num => parseFloat(num));
      } else if (Array.isArray(credit_debit_amount)) {
        amounts = credit_debit_amount.map(num => parseFloat(num));
      } else if (!isNaN(parseFloat(credit_debit_amount))) {
        amounts = [parseFloat(credit_debit_amount)];
      }
  
      // 🔹 (5) Use balance to determine if transaction is credit or debit
      let prevBalance = index > 0 ? parseFloat(transactions[index - 1]?.balance_amount || 0) : null;
      let newBalance = parseFloat(balance_amount);
  
      if (prevBalance !== null) {
        if (newBalance > prevBalance) {
          // 🔹 If balance increased, it's a credit transaction
          credit_amount = amounts[0] || "0.00";
          debit_amount = "0.00";
        } else if (newBalance < prevBalance) {
          // 🔹 If balance decreased, it's a debit transaction
          debit_amount = amounts[0] || "0.00";
          credit_amount = "0.00";
        } else {
          // 🔹 If balance didn't change, check manually
          verified = false;
        }
      } else {
        // 🔹 First transaction (no previous balance)
        verified = false;
      }
  
      transactionCount++;
  
      return {
        ...transaction,
        date1,
        date2,
        credit_amount: credit_amount || "0.00",
        debit_amount: debit_amount || "0.00",
        verified: verified ? "✅" : "❌",
      };
    });
  
    try {
      await updateDoc(doc(db, "clients", id), {
        transactions: updatedTransactions,
        number_of_transactions: transactionCount,
      });
  
      setTransactions(updatedTransactions);
      setRefreshKey(prev => prev + 1);
      alert(`Verification Complete! ${transactionCount} transactions processed.`);
    } catch (err) {
      console.error("Error updating transactions:", err);
      setError("Failed to update transactions.");
    }
  };
  
  // 🔹 Function to Format Dates (Handles different formats)
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
  
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr; // Already in correct format
  
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", Mei: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Okt: "10", November: "11", Des: "12",
    };
  
    const match = dateStr.match(/^(\d{1,2}) (\w+)/);
    if (match) {
      let day = match[1].padStart(2, "0");
      let month = months[match[2]] || "00";
      let year = new Date().getFullYear(); // Default to current year
      return `${day}/${month}/${year}`;
    }
  
    return dateStr; // Return unchanged if no match
  };
  

  if (loading) return <p className="text-white">Loading transactions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-h-[800px] overflow-y-auto overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-md relative">
      <div className="sticky top-0 bg-gray-900 p-4 z-10 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Verify Transactions</h2>
        <div>
          <Button 
            text="Verify Transactions" 
            small 
            onClick={handleVerifyTransactions} 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" 
          />
        </div>
      </div>  

      <Table key={refreshKey}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 border border-gray-600">✅</th>
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
              <tr key={index} className={`border-b border-gray-700 text-white ${transaction.verified === "❌" ? "bg-red-900" : ""}`}>
                <td className="p-2 border border-gray-600">{transaction.verified || "?"}</td>
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
            <tr><td colSpan="10" className="text-center p-4 text-gray-400">No transactions available</td></tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default VerifyTransactions;
