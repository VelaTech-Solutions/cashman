import React from 'react';
import moment from 'moment';

const BudgetMetric = ({ category, transactions, months }) => {
  const { name, filter, key } = category;

  // Calculate rows, month totals, grand total, and grand average
  const rows = transactions.filter(filter).reduce((acc, t) => {
    const m = moment(t.date1, ["DD/MM/YYYY"]).format("MMM");
    const sub = t.subcategory || "Uncategorized";
    if (!acc[sub]) acc[sub] = { total: 0 };
    if (!acc[sub][m]) acc[sub][m] = 0;
    acc[sub][m] += parseFloat(t[key]) || 0;
    acc[sub].total += parseFloat(t[key]) || 0;
    return acc;
  }, {});

  const monthTotals = months.reduce((acc, m) => {
    acc[m] = Object.values(rows).reduce((s, r) => s + (r[m] || 0), 0);
    return acc;
  }, {});

  const grandTotal = Object.values(monthTotals).reduce((s, v) => s + v, 0).toFixed(2);
  const validMonths = Object.values(monthTotals).filter(v => v !== 0);
  const grandAvg = validMonths.length ? (grandTotal / validMonths.length).toFixed(2) : "0.00";


export default BudgetMetric;

// this is a function