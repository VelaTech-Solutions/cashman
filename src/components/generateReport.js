import * as XLSX from "xlsx";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const generateReport = async (clientId) => {
  try {
    console.log(`Generating report for client: ${clientId}`);

    // Initialize Firebase Storage
    const storage = getStorage();
    const templatePath = "template/template_budget.xlsx";
    const templateRef = ref(storage, templatePath);

    // Fetch Template URL
    const templateURL = await getDownloadURL(templateRef);
    console.log("✅ Template URL:", templateURL);

    // Fetch Template File
    const response = await fetch(templateURL);
    if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);
    const templateBuffer = await response.arrayBuffer();

    // Load Template into XLSX
    const workbook = XLSX.read(new Uint8Array(templateBuffer), { type: "array" });

    console.log("✅ Excel Template Loaded Successfully!");
    
    return { success: true, message: "Template loaded", templateURL };
  } catch (error) {
    console.error("❌ Error generating report:", error.message);
    return { success: false, message: error.message };
  }
};

export default generateReport;
