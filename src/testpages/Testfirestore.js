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
  const [surname, setSurname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        surname,
        name,
      );
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
      console.error(
        "Error creating user or adding to Firestore: ",
        error.message,
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <motion.div
        className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg transition-all duration-300`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4">
          <h1 className="text-xl font-semibold text-white">
            Test Firebase Firestore
          </h1>
        </div>
        <nav className="space-y-4">
          <Link to="/dashboard" className="hover:text-white transition">
            Back to Dashboard
          </Link>
        </nav>
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
          Testing Firestore
        </h2>
        <motion.input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
        />
        <motion.input
          type="text"
          name="clientSurname"
          placeholder="Client Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
        />

        <motion.button
          type="submit"
          onClick={handleSubmit}
          className={`w-full p-2 rounded ${
            isSubmitting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        >
          {isSubmitting ? "Saving..." : "Save Client Details"}
        </motion.button>

        {submitSuccess && (
          <motion.p
            className="text-green-400 text-lg mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            🎉 Client details saved successfully!
          </motion.p>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md px-4 py-2"
        >
          Submit
        </button>
      </section>

      {/* <form onSubmit={handleSubmit} className="flex flex-col items-center">
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

                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-md px-4 py-2"
                >
                    Submit
                </button>
            </form> */}
    </div>
  );
};

export default Testfirestore;
