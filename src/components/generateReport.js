// component/generateReport.js
import * as XLSX from "xlsx"; // To handle Excel templates
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import LoadClientData from "./LoadClientData"; // Adjusted import

const storage = getStorage();

const generateReport = async (clientId) => {
  try {
    console.log(`Generating report for client: ${clientId}`);

    // 1. Load Client Data
    const clientData = await LoadClientData(clientId);
    if (!clientData) throw new Error("Client data not found.");
    const transactions = clientData.transactions || [];

    // 2. Grab the Report Template
    const templatePath = "template/template_budget.xlsx";
    const templateRef = ref(storage, templatePath);
    const templateURL = await getDownloadURL(templateRef);
    const templateBuffer = await fetch(templateURL).then((res) => res.arrayBuffer());
    console.log("Template downloaded successfully.");

    // Load the template into XLSX
    const workbook = XLSX.read(new Uint8Array(templateBuffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // 3. Perform Calculations
    const categorizedData = transactions.reduce((acc, txn) => {
      const { category, subcategory, balance_amount, date1 } = txn;
      if (!category || !subcategory || !balance_amount) return acc;

      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = {};

      // Group by month
      const transactionMonth = new Date(date1).getMonth() + 1; // Convert to 1-indexed month
      acc[category][subcategory][transactionMonth] =
        (acc[category][subcategory][transactionMonth] || 0) + parseFloat(balance_amount);

      return acc;
    }, {});

    console.log("Categorized data:", categorizedData);

    // Map categorized data to template
    const categoriesToRows = {
      INCOME: { Salary: 5, "Rental Income": 6, Other: 10 },
      SAVINGS: { "Unit Trust": 19, Education: 21 },
      // Add more mappings as per your template
    };

    const monthsToColumns = { 1: "C", 2: "D", 3: "E", 4: "F", 5: "G", 6: "H", 7: "I", 8: "J", 9: "K", 10: "L", 11: "M", 12: "N" };

    for (const [category, subcategories] of Object.entries(categorizedData)) {
      for (const [subcategory, months] of Object.entries(subcategories)) {
        const row = categoriesToRows[category]?.[subcategory];
        if (!row) {
          console.warn(`No row mapping found for ${category} > ${subcategory}`);
          continue;
        }

        for (const [month, total] of Object.entries(months)) {
          const column = monthsToColumns[month];
          if (!column) {
            console.warn(`No column mapping found for month: ${month}`);
            continue;
          }
          sheet[`${column}${row}`] = { v: total }; // Write total into the cell
        }
      }
    }

    console.log("Data mapped to template.");

    // 4. Save the Report
    const reportBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    const reportPath = `reports/${clientId}/report_${Date.now()}.xlsx`;
    const reportRef = ref(storage, reportPath);
    await uploadBytes(reportRef, reportBuffer);
    console.log(`Report uploaded to: ${reportPath}`);

    return { success: true, message: "Report generated successfully.", reportPath };
  } catch (error) {
    console.error("Error generating report:", error.message);
    return { success: false, message: error.message };
  }
};

export default generateReport;
