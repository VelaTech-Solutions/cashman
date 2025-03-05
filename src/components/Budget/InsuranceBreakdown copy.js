// src/pages/InsuranceBreakdown.js
// import React, { useState } from "react";

//   // 📌 Insurance Breakdown Data Constants

// const ciflcData = [  // Current Insurance - Funeral & Life Cover (Risk)
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// const cisisData = [  // Current Insurance - Savings & Investments
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// const cistiData = [  // Current Insurance - Short-Term Insurance
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// // 📌 Restructure Data Constants

// const rflcData = [  // Restructure - Funeral & Life Cover (Risk)
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// const rsiData = [  // Restructure - Savings & Investments
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// const rstiData = [  // Restructure - Short-Term Insurance
//   { name: "Institution" },
//   { name: "Type" },
//   { name: "Amount" }
// ];

// const rnotesData = [  // Restructure - Notes
//   { name: "Free Text / Description" }
// ];
  

// const InsuranceBreakdown = ({ title, data = [], months = [] }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
//       <button
//         className="w-full text-left text-lg font-semibold py-2 px-4 bg-gray-700 text-white rounded"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {title} {isOpen ? "▼" : "▶"}
//       </button>

//       {isOpen && (
//         <table className="w-full text-left border-collapse mt-2">
//           <thead>
//             <tr className="bg-gray-700 text-white">
//               <th className="p-2 border">Category</th>
//               {months.map((month, index) => (
//                 <th key={index} className="p-2 border">{month}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.length > 0 ? (
//               data.map((item, index) => (
//                 <tr key={index} className="border-b">
//                   <td className="p-2 font-semibold text-white">{item.name}</td>
//                   {months.map((_, monthIndex) => (
//                     <td key={monthIndex} className="p-2">R -</td>
//                   ))}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={months.length + 1} className="p-2 text-center text-gray-400">
//                   No data available
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export { ciflcData, cisisData, cistiData, rflcData, rsiData, rstiData, rnotesData };
// export default InsuranceBreakdown;
