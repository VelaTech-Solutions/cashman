// import React, { useEffect, useState } from "react";
// import { db } from "../firebase/config";
// import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

// const CategorizeTransactions = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch transactions, categories, subcategories, and clients
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch transactions
//         const transactionsSnapshot = await getDocs(collection(db, "transactions"));
//         const transactionsData = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setTransactions(transactionsData);

//         // Fetch categories
//         const categoriesSnapshot = await getDocs(collection(db, "categories"));
//         const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setCategories(categoriesData);

//         // Fetch subcategories
//         const subcategoriesSnapshot = await getDocs(collection(db, "subcategories"));
//         const subcategoriesData = subcategoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setSubcategories(subcategoriesData);

//         // Fetch clients
//         const clientsSnapshot = await getDocs(collection(db, "clients"));
//         const clientsData = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setClients(clientsData);

//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data: ", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleCategoryChange = async (transactionId, newCategory) => {
//     try {
//       const transactionRef = doc(db, "transactions", transactionId);
//       await updateDoc(transactionRef, { category: newCategory });
//       setTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, category: newCategory } : tx));
//     } catch (error) {
//       console.error("Error updating category: ", error);
//     }
//   };

//   const handleSubcategoryChange = async (transactionId, newSubcategory) => {
//     try {
//       const transactionRef = doc(db, "transactions", transactionId);
//       await updateDoc(transactionRef, { subcategory: newSubcategory });
//       setTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, subcategory: newSubcategory } : tx));
//     } catch (error) {
//       console.error("Error updating subcategory: ", error);
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Categorize Transactions</h1>
//       <table className="min-w-full table-auto border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border border-gray-300 px-4 py-2">Transaction</th>
//             <th className="border border-gray-300 px-4 py-2">Amount</th>
//             <th className="border border-gray-300 px-4 py-2">Category</th>
//             <th className="border border-gray-300 px-4 py-2">Subcategory</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map(transaction => (
//             <tr key={transaction.id}>
//               <td className="border border-gray-300 px-4 py-2">{transaction.description}</td>
//               <td className="border border-gray-300 px-4 py-2">{transaction.amount}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 <select
//                   value={transaction.category || ""}
//                   onChange={e => handleCategoryChange(transaction.id, e.target.value)}
//                   className="border rounded px-2 py-1"
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map(category => (
//                     <option key={category.id} value={category.name}>{category.name}</option>
//                   ))}
//                 </select>
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 <select
//                   value={transaction.subcategory || ""}
//                   onChange={e => handleSubcategoryChange(transaction.id, e.target.value)}
//                   className="border rounded px-2 py-1"
//                 >
//                   <option value="">Select Subcategory</option>
//                   {subcategories.map(subcategory => (
//                     <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>
//                   ))}
//                 </select>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CategorizeTransactions;
