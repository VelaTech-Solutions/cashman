import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { LoadClientData } from "components/Common";

export async function generateBudgetReport({ clientId }) {
  try {
    const clientData = await LoadClientData(clientId);
    const transactions = clientData.transactions || [];

    const configDoc = (name) => doc(db, "settings", "budget", "config", name);

    const [mainSnap, monthsSnap] = await Promise.all([
      getDoc(configDoc("main")),
      getDoc(configDoc("months")),
    ]);

const subCategoryPlacements = mainSnap.exists()
  ? mainSnap.data().subCategoryPlacements || []
  : [];

const subCategoryRowMap = {};
subCategoryPlacements.forEach(({ subcategory, row }) => {
  subCategoryRowMap[subcategory] = parseInt(row, 10);
});


    const monthToColumn = monthsSnap.exists()
      ? monthsSnap.data().monthToColumn || {}
      : {};

    const response = await fetch(
      "https://us-central1-cashman-790ad.cloudfunctions.net/getBudgetTemplate"
    );
    if (!response.ok) throw new Error("Failed to fetch template");

    const buffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet("Personal Budget");
    if (!worksheet) throw new Error("Worksheet 'Personal Budget' not found");

transactions.forEach(({ subcategory, credit_amount, debit_amount, date1 }) => {
  if (!subcategory || !date1) return;

  const credit = parseFloat(credit_amount) || 0;
  const debit = parseFloat(debit_amount) || 0;
  const amount = Math.abs(credit - debit);

  if (amount === 0) return;

  const [day, month, year] = date1.split("/");
  const monthKey = new Date(+year, +month - 1).toLocaleString("en-US", { month: "short" });

  const row = subCategoryRowMap[subcategory];
  const col = monthToColumn[monthKey];
  if (row && col) {
    const cell = worksheet.getCell(`${col}${row}`);
    cell.value = (cell.value || 0) + amount;
  }
});


    const outputBuffer = await workbook.xlsx.writeBuffer();

    const storage = getStorage();
    const fileRef = ref(storage, `budgets/${clientId}.xlsx`);
    await uploadBytes(
      fileRef,
      new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    saveAs(
      new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${clientId}-budget.xlsx`
    );
  } catch (error) {
    console.error("Failed to generate budget report:", error);
  }
}
