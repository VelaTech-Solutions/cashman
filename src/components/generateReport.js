import * as XLSX from "xlsx";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import LoadClientData from "./LoadClientData";

const storage = getStorage();

const generateReport = async (clientId) => {
  try {
    console.log(`Generating report for client: ${clientId}`);

    // Load Client Data
    const clientData = await LoadClientData(clientId);
    if (!clientData) throw new Error("Client data not found.");
    const transactions = clientData.transactions || [];

    // Grab the Report Template
    const templatePath = "template/template_budget.xlsx";
    const templateRef = ref(storage, templatePath);

    // Fetch Template
    const templateURL = await getDownloadURL(templateRef);
    const response = await fetch(templateURL);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateBuffer = await response.arrayBuffer();

    // Load Template into XLSX
    const workbook = XLSX.read(new Uint8Array(templateBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Process Transactions (Same logic you have for categorization)
    const categorizedData = transactions.reduce((acc, txn) => {
      const { category, subcategory, balance_amount, date1 } = txn;
      if (!category || !subcategory || !balance_amount) return acc;

      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = {};

      const transactionMonth = new Date(date1).getMonth() + 1;
      acc[category][subcategory][transactionMonth] =
        (acc[category][subcategory][transactionMonth] || 0) + parseFloat(balance_amount);

      return acc;
    }, {});

    // Mapping Data to Excel
    const categoriesToRows = {
      INCOME: { Salary: 5, "Rental Income": 6, Other: 10 },
      SAVINGS: { "Unit Trust": 19, Education: 21 },
    };
    const monthsToColumns = { 1: "C", 2: "D", 3: "E", 4: "F", 5: "G", 6: "H", 7: "I", 8: "J", 9: "K", 10: "L", 11: "M", 12: "N" };

    for (const [category, subcategories] of Object.entries(categorizedData)) {
      for (const [subcategory, months] of Object.entries(subcategories)) {
        const row = categoriesToRows[category]?.[subcategory];
        if (!row) continue;

        for (const [month, total] of Object.entries(months)) {
          const column = monthsToColumns[month];
          if (!column) continue;
          XLSX.utils.sheet_add_aoa(sheet, [[total]], { origin: `${column}${row}` });
        }
      }
    }

    // Save Report
    const reportBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const reportBlob = new Blob([reportBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const reportPath = `reports/${clientId}/report_${Date.now()}.xlsx`;
    const reportRef = ref(storage, reportPath);
    await uploadBytes(reportRef, reportBlob);

    // Get Download URL
    const downloadURL = await getDownloadURL(reportRef);
    console.log(`Report available at: ${downloadURL}`);

    return { success: true, message: "Report generated successfully.", downloadURL };
  } catch (error) {
    console.error("Error generating report:", error.message);
    return { success: false, message: error.message };
  }
};

export default generateReport;


// import * as XLSX from "xlsx";
// import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
// import LoadClientData from "./LoadClientData";

// const storage = getStorage();

// const generateReport = async (clientId) => {
//   try {
//     console.log(`Generating report for client: ${clientId}`);

//     // 1️⃣ Load Client Data
//     const clientData = await LoadClientData(clientId);
//     if (!clientData) throw new Error("Client data not found.");
//     const transactions = clientData.transactions || [];

//     // 2️⃣ Fetch the Budget Template from Firebase Storage
//     const templatePath = "template/template_budget.xlsx";
//     const templateRef = ref(storage, templatePath);
//     const templateURL = await getDownloadURL(templateRef);
//     console.log(`Fetching template from: ${templateURL}`);

//     const response = await fetch(templateURL);
//     if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
//     const templateBuffer = await response.arrayBuffer();

//     // 3️⃣ Load Template into XLSX
//     const workbook = XLSX.read(new Uint8Array(templateBuffer), { type: "array" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];

//     // 4️⃣ Categorize Transactions & Summarize Amounts
//     const categorizedData = transactions.reduce((acc, txn) => {
//       const { category, subcategory, balance_amount, date1 } = txn;
//       if (!category || !subcategory || !balance_amount) return acc;

//       if (!acc[category]) acc[category] = {};
//       if (!acc[category][subcategory]) acc[category][subcategory] = {};

//       // Extract month (1 = Jan, 2 = Feb, etc.)
//       const transactionMonth = new Date(date1).getMonth() + 1;

//       // Sum up amounts per subcategory and month
//       acc[category][subcategory][transactionMonth] =
//         (acc[category][subcategory][transactionMonth] || 0) + parseFloat(balance_amount);

//       return acc;
//     }, {});

//     console.log("Categorized data:", categorizedData);

//     // 5️⃣ Row and Column Mappings (Hardcoded Rows, Dynamic Subcategories)
//     const predefinedRows = {
//       "INCOME": { startRow: 5 },
//       "SAVINGS": { startRow: 19 },
//       "HOUSING": { startRow: 26 },
//       "TRANSPORTATION": { startRow: 36 },
//       "EXPENSES": { startRow: 45 },
//       "DEBT": { startRow: 55 },
//     };

//     const monthsToColumns = { 1: "C", 2: "D", 3: "E", 4: "F", 5: "G", 6: "H", 7: "I", 8: "J", 9: "K", 10: "L", 11: "M", 12: "N" };

//     // 6️⃣ Insert Transactions into Excel at the Correct Rows & Columns
//     for (const [category, subcategories] of Object.entries(categorizedData)) {
//       if (!predefinedRows[category]) {
//         console.warn(`Skipping unknown category: ${category}`);
//         continue; // Ignore unknown categories
//       }

//       let rowIndex = predefinedRows[category].startRow;

//       for (const [subcategory, months] of Object.entries(subcategories)) {
//         for (const [month, total] of Object.entries(months)) {
//           const column = monthsToColumns[month];
//           if (!column) {
//             console.warn(`Skipping unknown month: ${month}`);
//             continue;
//           }

//           // Write total into the corresponding cell dynamically
//           XLSX.utils.sheet_add_aoa(sheet, [[total]], { origin: `${column}${rowIndex}` });
//         }

//         rowIndex++; // Move to the next row for a new subcategory
//       }
//     }

//     console.log("Data successfully mapped to template.");

//     // 7️⃣ Save and Upload Report to Firebase Storage
//     const reportBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const reportBlob = new Blob([reportBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     const reportPath = `reports/${clientId}/report_${Date.now()}.xlsx`;
//     const reportRef = ref(storage, reportPath);
//     await uploadBytes(reportRef, reportBlob);

//     // 8️⃣ Get Download URL and Return
//     const downloadURL = await getDownloadURL(reportRef);
//     console.log(`Report available at: ${downloadURL}`);

//     return { success: true, message: "Report generated successfully.", downloadURL };
//   } catch (error) {
//     console.error("Error generating report:", error.message);
//     return { success: false, message: error.message };
//   }
// };

// export default generateReport;
