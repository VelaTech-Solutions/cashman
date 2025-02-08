// src/index.js - Entry point for your app

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import { auth, db } from "./firebase/firebase"; // Import initialized services

// console.log("Auth service initialized:", auth);
// console.log("Firestore service initialized:", db);

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
Uncaught FirebaseError: Firebase: Error (auth/invalid-api-key).
    at er (assert.ts:152:38)
    at tr (assert.ts:177:11)
    at ct.instanceFactory (register.ts:72:9)
    at dt.getOrInitializeService (provider.ts:318:33)
    at dt.initialize (provider.ts:242:27)
    at n.popupRedirectResolver (initialize.ts:66:25)
    at index.ts:83:16
    at firebase.js:46:14
    at index.js:16:9
    at index.js:16:9
er @ assert.ts:152
tr @ assert.ts:177
(anonymous) @ register.ts:72
getOrInitializeService @ provider.ts:318
initialize @ provider.ts:242
n.popupRedirectResolver @ initialize.ts:66
(anonymous) @ index.ts:83
(anonymous) @ firebase.js:46
(anonymous) @ index.js:16
(anonymous) @ index.js:16