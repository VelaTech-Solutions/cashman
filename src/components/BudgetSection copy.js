import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import LoadClientData from "../components/LoadClientData";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firebase Firestore


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// List of all budget categories (no need to manually add in Budget.js)
const budgetCategories = [
    "Income",
    "Savings",
    "Housing",
    "Transportation",
    "Expenses",
    "Debt"
];

const BudgetSection = () => {
    const { id } = useParams();
    const [clientData, setClientData] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientData = await LoadClientData(id);
                setClientData(clientData);
            } catch (err) {
                console.error("Error fetching data:", err.message);
            }
        };
        fetchData();
    }, [id]);

    // **Process Transactions for Each Budget Section**
    const processTransactions = (category) => {
        if (!clientData || !clientData.transactions) return { data: [], monthlyTotals: {}, avgTotal: "0.00" };

        const categoryTransactions = clientData.transactions.filter(txn => txn.category === category);

        const groupedData = categoryTransactions.reduce((acc, txn) => {
            const month = moment(txn.date1, "DD/MM/YYYY").format("MMM");

            if (!acc[txn.subcategory]) {
                acc[txn.subcategory] = { name: txn.subcategory, monthlyTotals: {}, total: 0 };
            }

            acc[txn.subcategory].monthlyTotals[month] =
                (parseFloat(acc[txn.subcategory].monthlyTotals[month] || 0) + parseFloat(txn.debit_amount || txn.credit_amount || 0)).toFixed(2);

            acc[txn.subcategory].total =
                (parseFloat(acc[txn.subcategory].total) + parseFloat(txn.debit_amount || txn.credit_amount || 0)).toFixed(2);

            return acc;
        }, {});

        const structuredData = Object.values(groupedData);

        // **Step 1: Calculate Monthly Totals**
        const monthlyTotals = months.reduce((acc, month) => {
            acc[month] = structuredData.reduce(
                (sum, item) => sum + parseFloat(item.monthlyTotals[month] || 0),
                0
            ).toFixed(2);
            return acc;
        }, {});

        // **Step 2: Calculate the Average Total (ignoring 0.00 months)**
        const totalValues = Object.values(monthlyTotals)
            .map(value => parseFloat(value))
            .filter(value => value !== 0); // Ignore months with zero values

        const avgTotal = totalValues.length
            ? (totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length).toFixed(2)
            : "0.00";

        return { data: structuredData, monthlyTotals, avgTotal };
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
            {budgetCategories.map((category, catIndex) => {
                const { data, monthlyTotals, avgTotal } = processTransactions(category);

                return (
                    <div key={catIndex} className="mb-6">
                        <button
                            className="w-full text-left text-lg font-semibold py-2 px-4 bg-gray-700 text-white rounded"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {category.toUpperCase()} {isOpen ? "▼" : "▶"}
                        </button>

                        {isOpen && (
                            <table className="w-full text-left border-collapse mt-2">
                                <thead>
                                    <tr className="bg-gray-700 text-white">
                                        <th className="p-2 border">Category</th>
                                        {months.map((month, index) => (
                                            <th key={index} className="p-2 border">{month}</th>
                                        ))}
                                        <th className="p-2 border">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Data Rows */}
                                    {data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2 font-semibold text-white">{item.name}</td>
                                                {months.map((month, monthIndex) => (
                                                    <td key={monthIndex} className="p-2 text-center">
                                                        {item.monthlyTotals[month] ? `R ${item.monthlyTotals[month]}` : "-"}
                                                    </td>
                                                ))}
                                                <td className="p-2 text-blue-400 font-bold">R {item.total}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={months.length + 2} className="p-2 text-center text-gray-400">
                                                No data available
                                            </td>
                                        </tr>
                                    )}

                                    {/* Total Row */}
                                    <tr className="bg-gray-900 text-yellow-400">
                                        <td className="p-2 font-semibold">TOTAL</td>
                                        {months.map((month, index) => (
                                            <td key={index} className="p-2 text-center font-bold">R {monthlyTotals[month]}</td>
                                        ))}
                                        <td className="p-2 text-yellow-400 font-bold">-</td>
                                    </tr>

                                    {/* Average Row */}
                                    <tr className="bg-gray-700 text-green-400">
                                        <td className="p-2 font-semibold">AVERAGE</td>
                                        <td colSpan={months.length} className="p-2 text-center font-bold">R {avgTotal}</td>
                                        <td className="p-2 text-green-400 font-bold">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BudgetSection;
