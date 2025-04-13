// src/components/Transactions/EditTransactions/Containers/ContainerTables.js

import React, { useState } from "react";

// Component Imports
import { ViewSwitcher } from 'components/Common';
import EditTableOriginal from "../Tables/EditTableOriginal";
import EditTableInvalid from "../Tables/EditTableInvalid";
import EditTableMissingDates from "../Tables/EditTableMissingDates";
import EditTableMissingDescriptions from "../Tables/EditTableMissingDescriptions";
import EditTableMissingCreditDebitAmounts from "../Tables/EditTableMissingCreditDebitAmounts";
import EditTableMissingBalanceAmounts from "../Tables/EditTableMissingBalanceAmounts";
import EditTableMissingAllAmounts from "../Tables/EditTableMissingAllAmounts";


const ContainerTables = ({ id }) => {
  const [activeView, setActiveView] = useState("view1");
  const views = [
    {
      key: "view1",
      label: "Original",
      component: (
        <EditTableOriginal
          id={id}
        />
      ),
    },
    {
      key: "view2",
      label: "Invalid",
      component: (
        <EditTableInvalid
          id={id}
        />
      ),
    },
    {
      key: "view3",
      label: "Missing Dates",
      component: (
        <EditTableMissingDates
          id={id}
        />
      ),
    },
    {
      key: "view4",
      label: "Missing Descriptions",
      component: (
        <EditTableMissingDescriptions
          id={id}
        />
      ),
    },
    {
      key: "view5",
      label: "Missing Credit & Debit",
      component: (
        <EditTableMissingCreditDebitAmounts
          id={id}
        />
      ),
    },
    {
      key: "view6",
      label: "Missing Balance",
      component: (
        <EditTableMissingBalanceAmounts
          id={id}
        />
      ),
    },
    {
      key: "view7",
      label: "Missing All Amounts",
      component: (
        <EditTableMissingAllAmounts
          id={id}
        />
      ),
    },
  ];

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
      <div className="mt-6">
        {views.find((v) => v.key === activeView)?.component}
      </div>
    </div>
  );
};

export default ContainerTables;
