import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

export const fetchCategoriesFromDB = async () => {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getUniqueTransactions = (transactions = []) => {
  const seen = new Set();
  return transactions.filter((t) => {
    if (!t.description || seen.has(t.description)) return false;
    seen.add(t.description);
    return true;
  });
};
