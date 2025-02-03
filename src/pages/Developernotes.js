// // src/pages/Developernotes.js

// import React, { useEffect, useState } from "react";


// // Firebase imports
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, db } from "../firebase/firebase";
// import { collection, getDocs } from "firebase/firestore";

// const Developernotes = () => {
//   const [userEmail, setUserEmail] = useState("Not logged in");
//   const auth = getAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserEmail(user.email);
//       } else {
//         setUserEmail("Not logged in");
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="app">
//       <header className="app-header">
//         <div className="app-header-logo">
//           <div className="logo">
//             <h1 className="logo-title">
//               <span>Developer Notes</span>
//             </h1>
//           </div>
//         </div>
//         <div className="app-header-actions">
//           <button className="user-profile">
//             <span>{userEmail}</span>
//             <span>
//               <img
//                 src="https://img.icons8.com/pastel-glyph/100/person-male--v1.png"
//                 alt="User Avatar"
//               />
//             </span>
//           </button>
//         </div>
//         <div className="app-header-mobile">
//           <button className="icon-button large">
//             <i className="ph-list"></i>
//           </button>
//         </div>
//       </header>

//       <div className="app-body">
//         <div className="app-body-navigation">
//           <nav className="navigation">
//             <a href="/dashboard">
//               <i className="ph-sign-out"></i>
//               <span>Back to Dashboard</span>
//             </a>
//           </nav>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Developernotes;
