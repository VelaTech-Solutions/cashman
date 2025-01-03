// src/pages/Testfirestore.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

// Firebase imports
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Firestore imports
import { auth, db } from "../firebase/firebase"; // Firebase and Firestore setup

const Testfirestore = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // password field

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create user using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created: ", user);

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                uid: user.uid,
                createdAt: new Date(),
            });
            console.log("User added to Firestore");

            // Optionally, handle additional post-sign-up logic here
        } catch (error) {
            console.error("Error creating user or adding to Firestore: ", error.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen"
        >
            <h1 className="text-4xl font-bold mb-4">Test Firebase Authentication & Firestore</h1>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 mb-4"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 mb-4"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 mb-4"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-md px-4 py-2"
                >
                    Submit
                </button>
            </form>
            <Link to="/">
                <button className="bg-blue-500 text-white rounded-md px-4 py-2 mt-4">
                    Back
                </button>
            </Link>
        </motion.div>
    );
};

export default Testfirestore;
