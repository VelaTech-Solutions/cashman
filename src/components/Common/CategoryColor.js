// src/components/Common/CategoryColor.js

const getCategoryColor = (category, mode = "bg") => {
  const colorMap = {
    Income: "green",
    Savings: "blue",
    Housing: "purple",
    Transport: "yellow",
    Expenses: "red",
    Debt: "gray",
    Default: "gray",
  };

  const color = colorMap[category] || colorMap.Default;
  return mode === "text" ? `text-${color}-500` : `bg-${color}-600`;
};

// 👇 Exporting as default so it works with your index.js
const CategoryColor = { getCategoryColor };
export default CategoryColor;