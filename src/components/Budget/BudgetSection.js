import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";

// Components Imports
import LoadClientData from "components/LoadClientData";
import Table from "components/Table";

// Firebase Imports
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const budgetCategories = ["Income", "Savings", "Housing", "Transportation", "Expenses", "Debt"];

const BudgetSection = () => {
    const { id } = useParams();
    const [clientData, setClientData] = useState(null);
    const [budgetData, setBudgetData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
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

    const processTransactions = (category) => {
        if (!clientData?.transactions) return { monthlyTotals: {}, avgTotal: "0.00", totalSum: "0.00" };

        const categoryTransactions = clientData.transactions.filter(txn => txn.category === category);

        const groupedData = categoryTransactions.reduce((acc, txn) => {
            const month = moment(txn.date1, "DD/MM/YYYY").format("MMM");
            acc[month] = (parseFloat(acc[month] || 0) + parseFloat(txn.debit_amount || txn.credit_amount || 0)).toFixed(2);
            return acc;
        }, {});

        const totalSum = Object.values(groupedData).reduce((sum, value) => sum + parseFloat(value), 0).toFixed(2);
        const totalValues = Object.values(groupedData).map(parseFloat).filter(value => value !== 0);
        const avgTotal = totalValues.length
            ? (totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length).toFixed(2)
            : "0.00";

        return { monthlyTotals: groupedData, avgTotal, totalSum };
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            {budgetCategories.map((category, catIndex) => {
                const { monthlyTotals, avgTotal, totalSum } = processTransactions(category);
                const categoryTransactions = clientData?.transactions?.filter(txn => txn.category === category) || [];

                // Group transactions by subcategory
                const subcategories = categoryTransactions.reduce((acc, txn) => {
                    const subcat = txn.subcategory || 'Uncategorized';
                    if (!acc[subcat]) {
                        acc[subcat] = {
                            name: subcat,
                            monthlyTotals: {},
                            total: 0
                        };
                    }
                    const month = moment(txn.date1, "DD/MM/YYYY").format("MMM");
                    const amount = parseFloat(txn.debit_amount || txn.credit_amount || 0);
                    acc[subcat].monthlyTotals[month] = (parseFloat(acc[subcat].monthlyTotals[month] || 0) + amount).toFixed(2);
                    acc[subcat].total = (parseFloat(acc[subcat].total) + amount).toFixed(2);
                    return acc;
                }, {});

                const subcategoryList = Object.values(subcategories);

                return (
                    <div key={catIndex} className="mb-6 border border-gray-600 rounded-lg overflow-hidden">
                        <button
                            className="w-full text-left text-lg font-semibold py-2 px-4 bg-gray-700 text-white rounded"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {category.toUpperCase()} {isOpen ? "▼" : "▶"}
                        </button>

                        {isOpen && (
                        <Table className="w-full table-fixed border-collapse mt-2">
                            <thead>
                                <tr className="bg-gray-700 text-white">
                                    <th className="p-3 border border-gray-600 w-1/6">Subcategory</th>
                                    {months.map((month, index) => (
                                        <th key={index} className="p-3 border border-gray-600 w-1/12">{month}</th>
                                    ))}
                                    <th className="p-3 border border-gray-600 w-1/6">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subcategoryList.length > 0 ? (
                                    subcategoryList.map((sub, subIndex) => (
                                        <tr key={subIndex} className={`border-b ${subIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}>
                                            <td className="p-3 font-semibold text-white">{sub.name}</td>
                                            {months.map((month, monthIndex) => (
                                                <td key={monthIndex} className="p-3 text-center">
                                                    {sub.monthlyTotals[month] ? `R ${sub.monthlyTotals[month]}` : "-"}
                                                </td>
                                            ))}
                                            <td className="p-3 text-blue-400 font-bold">R {sub.total}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-b bg-gray-900">
                                        <td className="p-3 font-semibold text-white">{category}</td>
                                        <td className="p-3 text-center text-gray-400" colSpan={months.length + 2}>
                                            No data available
                                        </td>
                                    </tr>
                                )}

                                {/* Category Totals */}
                                <tr className="bg-gray-900 text-yellow-400 font-semibold">
                                    <td className="p-3 border border-gray-600">TOTAL</td>
                                    {months.map((month, index) => (
                                        <td key={index} className="p-3 text-center font-bold border border-gray-600">
                                            R {monthlyTotals[month] || "-"}
                                        </td>
                                    ))}
                                    <td className="p-3 text-yellow-400 font-bold border border-gray-600">R {totalSum}</td>
                                </tr>

                                {/* Category Average */}
                                <tr className="bg-gray-700 text-green-400 font-semibold">
                                    <td className="p-3 border border-gray-600">AVERAGE</td>
                                    {months.map((_, index) => (
                                        <td key={index} className="p-3 text-center font-bold border border-gray-600">
                                            {index === 0 ? `R ${avgTotal}` : ""}
                                        </td>
                                    ))}
                                    <td className="p-3 text-green-400 font-bold border border-gray-600">-</td>
                                    </tr>
                                </tbody>
                            </Table>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
export default BudgetSection;
