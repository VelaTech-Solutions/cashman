// src/components/Budget/BudgetSection.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Component Imports
import { 
  LoadClientData, 
  ViewSwitcher
} from "components/Common";
import BudgetView from "components/Budget/Views/BudgetView";
import BudgetViewByCategory from "components/Budget/Views/BudgetViewByCategory";
import BudgetViewByMonth from "components/Budget/Views/BudgetViewByMonth";
const BudgetSection = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Budget",
      component: (
      <BudgetView  clientId={clientId} />
      ),
    },
    {
      key: "view2",
      label: "By Category",
      component: (
        <BudgetViewByCategory 
        clientId={clientId}
        />
      ),
    },
    {
      key: "view3",
      label: "By Month (WIP)",
      component: (
        <BudgetViewByMonth 
        clientId={clientId}
        />
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LoadClientData(clientId);
        setClientData(data);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };
    fetchData();
  }, [clientId]);

  if (!clientData) return <div className="text-center py-10 text-gray-400">Loading client data...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl text-white font-bold mb-4">Budget Overview</h2>
      <div className="flex items-center h-10 space-x-2">
        <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      </div>
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default BudgetSection;
