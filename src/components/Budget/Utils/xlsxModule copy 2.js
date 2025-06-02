import React, { useState,useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import moment from "moment";


export default function generateBudgetReport({ clientId, templateBlob }) {
// export const generateBudgetReport = async (clientId) => {

  const [monthToColumn, setMonthToColumn] = useState({});
  const [subCategoryPlacements, setSubCategoryPlacements] = useState({});
  const configDoc = (settings) => 
    doc(db, "settings", "budget", "config", settings);
  try {
    console.log("📥 Fetching budget template...");

    // Fetch template
    const response = await fetch(
      "https://us-central1-cashman-790ad.cloudfunctions.net/getBudgetTemplate"
    );

    // "gs://cashman-790ad.firebasestorage.app/template/template.xlsx"
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // 🔒 Hardcoded sheet name
    const worksheet = workbook.Sheets["Personal Budget"];
    if (!worksheet) throw new Error("Sheet 'Personal Budget' not found");

    // Fetch transactions from Firestore
    const db = getFirestore();
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    const transactions = clientSnap.data().transactions || [];

    useEffect(() => {
      const fetchConfigs = async () => {

        // Load subCategoryPlacements Settings
        const subCategoryPlacementsSnap = await getDoc(configDoc("main"));
        if (subCategoryPlacementsSnap.exists()) {
          setSubCategoryPlacements(subCategoryPlacementsSnap.data().subCategoryPlacements || {});
        }
        // Load monthToColumn Settings
        const monthSnap = await getDoc(configDoc("months"));
        if (monthSnap.exists()) {
          setMonthToColumn(monthSnap.data().monthToColumn || {});
        }
        // Add more settings here as needed
      };

      fetchConfigs();
    }, []);

    // console.log setting as a test
    console.log(subCategoryPlacements);
    console.log(monthToColumn);
// Uncaught runtime errors:
// ×
// ERROR
// Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
// 1. You might have mismatching versions of React and the renderer (such as React DOM)
// 2. You might be breaking the Rules of Hooks
// 3. You might have more than one copy of React in the same app
// See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.
// Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
// 1. You might have mismatching versions of React and the renderer (such as React DOM)
// 2. You might be breaking the Rules of Hooks
// 3. You might have more than one copy of React in the same app
// See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.
//     at Object.throwInvalidHookError (http://localhost:3000/static/js/bundle.js:232231:11)
//     at exports.useState (http://localhost:3000/static/js/bundle.js:250551:32)
//     at generateBudgetReport (http://localhost:3000/main.6dbd52616292b62b9bff.hot-update.js:35:92)
//     at onClick (http://localhost:3000/static/js/bundle.js:292020:112)
//     at executeDispatch (http://localhost:3000/static/js/bundle.js:237281:7)
//     at runWithFiberInDEV (http://localhost:3000/static/js/bundle.js:230023:68)
//     at processDispatchQueue (http://localhost:3000/static/js/bundle.js:237309:31)
//     at http://localhost:3000/static/js/bundle.js:237602:7
//     at batchedUpdates$1 (http://localhost:3000/static/js/bundle.js:230872:38)
//     at dispatchEventForPluginEventSystem (http://localhost:3000/static/js/bundle.js:237385:5)

// after clicking the gen button thhat showed up

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthToColumn = {
      Jan: "C", Feb: "D", Mar: "E", Apr: "F", May: "G", Jun: "H",
      Jul: "I", Aug: "J", Sep: "K", Oct: "L", Nov: "M", Dec: "N",
    };

    // Define the starting rows for each subcategory
    const cellMap = {
      Income: {
        "Salary": 5,
        "Rental Income": 6,
        "Additional Income": 7,
        "Pension": 8,
        "Maintenance": 9,
        "Other": 10,
        "Minus Insurance Paid from Payslip": 11,
        "Minus Utilities / Other Paid from Payslip": 12,
      },
      Savings: {
        "Unit Trust": 19,
        "Tax-Free Unit Trust": 20,
        "Education": 21,
        "Retirement": 22,
        "Endowment": 23,
        "Savings Plan/Account": 24,
        "Other": 25,
      },
      Housing: {
        "Home Loan": 32,
        "Rent": 33,
        "Levies": 34,
        "Water/Rates": 35,
        "Electricity": 36,
        "Other": 37,
      },
      Transportation: {
        "Car Payment": 44,
        "Insurance": 45,
        "Fuel": 46,
        "Public Transport": 47,
        "Parking": 47,
        "Uber/Bolt": 48,
        "Other": 49,
      },
      Expenses: {
        "Groceries": 56,
        "Airtime": 57,
        "Phone Contracts/Telkom": 58,
        "Phone Insurance": 59,
        "Clothing": 60,
        "Salon / Barber": 61,
        "Pet Supplies": 62,
        "School fees / Day Care": 63,
        "Sports fees/Stationary/Supplies": 64,
        "Cash Withdrawals": 65,
        "Cash Send / e-Wallet": 66,
        "Maintenance / 3rd Party Payments": 67,
        "Miscellaneous Payments": 68,
        "Rewards / Memberships": 69,
        "Banking Fees": 70,
        "Tithe/Donations": 71,
        "Other": 72,
        // (row 73 to 79) future placeholders

        // WELL-BEING / HEALTH (row 80) a placeholder
        "Medical aid": 81,
        "Pharmacy Expenses": 82,
        // (row 83 to 87) future placeholders

        // ENTERTAINMENT (row 88) a placeholder
        "Netflix": 89,
        "Dine-Out/Take-aways": 90,
        "Liquor/Alcohol": 91,
        "Vacation/Holidays": 92,
        "Other ": 93,

        // (row 94 to 96) future placeholders
        // "Other": 96, // last row for Expenses
      },
      Debt: {
        "Personal Loans": 112,
        "Credit Card": 113,
        "Overdraft": 114,
        "Student Loans": 115,
        "Savings Plan/Account": 116,
        "Other Paid from Payslip": 117,
        "Minus Insurance Paid from Payslip": 118,
        "Minus Utilities / Other Paid from Payslip": 119,
        "Other": 120,
      },
    };

    // Tally by category -> subcategory -> month
    const categoryData = {};

    transactions.forEach((txn) => {
      const category = txn.category;
      const subcategory = txn.subcategory;
      const date = txn.date1;
      const amount =
        category === "Income"
          ? parseFloat(txn.credit_amount || 0)
          : parseFloat(txn.debit_amount || 0);
      const month = date
        ? months[moment(date, ["DD/MM/YYYY"]).month()]// convert date to month
        : null;
    
      if (!category || !subcategory || !month) return;
      if (!cellMap[category] || !cellMap[category][subcategory]) return;
    
      if (!categoryData[category]) categoryData[category] = {};
      if (!categoryData[category][subcategory]) categoryData[category][subcategory] = {};
      if (!categoryData[category][subcategory][month])
        categoryData[category][subcategory][month] = 0;
    
      categoryData[category][subcategory][month] += amount;
    });
    


    // Insert into Excel
    Object.entries(categoryData).forEach(([category, subcats]) => {
      Object.entries(subcats).forEach(([subcategory, monthValues]) => {
        const startRow = cellMap[category]?.[subcategory];
        if (!startRow) return;

        Object.entries(monthValues).forEach(([month, amount]) => {
          const col = monthToColumn[month];
          const cell = `${col}${startRow}`;
          if (worksheet[cell]) {
            worksheet[cell].v = amount;  // only update value
          } else {
            worksheet[cell] = { t: "n", v: amount }; // only if cell missing
          }
        });
      });
    });

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Budget_Report_${clientId}.xlsx`);
    console.log("✅ Budget report generated successfully.");
  } catch (err) {
    console.error("❌ Failed to generate report:", err);
    alert("Failed to generate budget report.");
  }
};
