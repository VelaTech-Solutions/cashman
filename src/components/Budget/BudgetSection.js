import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadClientData from "components/LoadClientData";

import Income from "./categories/Income"; // Income
import Savings from "./categories/Savings"; // Savings
import Housing from "./categories/Housing"; //  Housing
import Transportation from "./categories/Transportation"; // Transportation
import Expenses from "./categories/Expenses"; // Expenses
import Debt from "./categories/Debt"; // Debt

import { getFirestore } from "firebase/firestore";

const BudgetSection = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(id);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [id]);

  if (!clientData) return <div className="text-center py-10 text-gray-400">Loading client data...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl text-white font-bold mb-4">Budget Overview</h2>
      <Income transactions={clientData.transactions} />
      <Savings transactions={clientData.transactions} />
      <Housing transactions={clientData.transactions} />
      <Transportation transactions={clientData.transactions} />
      <Expenses transactions={clientData.transactions} />
      <Debt transactions={clientData.transactions} />
    </div>
  );
};

export default BudgetSection;
