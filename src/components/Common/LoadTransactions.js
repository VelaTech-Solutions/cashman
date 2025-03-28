// src/components/LoadTransactions.js

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Import your Firestore instance

const LoadTransactions = async (id) => {
    try {
        const docRef = doc(db, "transactions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            return null;
        }
    } catch (err) {
        console.error("Error fetching data:", err.message);
        return null;
    }
};

export default LoadTransactions;