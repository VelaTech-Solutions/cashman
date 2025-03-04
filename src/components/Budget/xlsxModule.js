import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Fetch the budget template, insert data, and generate report
export const generateBudgetReport = async (budgetData, userId) => {
  try {
    console.log("📥 Fetching budget template...");

    // Fetch the template from Firebase Function
    const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/getBudgetTemplate");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Select the first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    console.log("✅ Template fetched successfully.");

    if (!budgetData) {
      console.error("❌ No budget data available.");
      return;
    }

    console.log("🔄 Processing transactions...");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Define the cell mappings for each category and month
    const cellMappings = {
      Income: { startRow: 5, column: "C" },
      Savings: { startRow: 19, column: "C" },
      Housing: { startRow: 32, column: "C" },
      Transportation: { startRow: 44, column: "C" },
      Expenses: { startRow: 56, column: "C" },
      Debt: { startRow: 112, column: "C" }
    };

    // Loop through each category and place values in the correct month column
    Object.entries(budgetData).forEach(([category, data]) => {
      if (!cellMappings[category] || !data.monthlyTotals) return;
      
      const { startRow, column } = cellMappings[category];

      months.forEach((month, index) => {
        if (data.monthlyTotals[month]) {
          const cellRef = `${column}${startRow + index}`;
          worksheet[cellRef] = { v: data.monthlyTotals[month] };
        }
      });

      // Insert total sum
      worksheet[`${column}${startRow + months.length}`] = { v: data.totalSum };
    });

    console.log("✅ Data inserted into template.");

    // Generate the modified Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Download the generated Excel report
    saveAs(blob, `Budget_Report_${userId}.xlsx`);
    console.log("📂 Report downloaded successfully.");
    
  } catch (error) {
    console.error("❌ Error processing template:", error);
    alert("Failed to generate budget report.");
  }
};
