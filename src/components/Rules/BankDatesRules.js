// src/components/Extract/BankDatesRules.js

// const BankDatesRules = {
//   "Absa Bank": (text) => {
//     // Absa has two formats: YYYY-MM-DD and DD/MM/YYYY
//     const regex = /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g;
//     return text.match(regex) || [];
//   },

//   "Capitec Bank": (text) => {
//     // Capitec uses DD/MM/YYYY, often appearing twice per transaction
//     const regex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
//     return text.match(regex) || [];
//   },

//   "Fnb Bank": (text) => {
//     // FNB uses "DD MMM" (e.g., 30 Jan)
//     const regex = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g;
//     return text.match(regex) || [];
//   },

//   "Ned Bank": (text) => {
//     // Nedbank uses DD/MM/YYYY format
//     const regex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
//     return text.match(regex) || [];
//   },

//   "Standard Bank": (text) => {
//     // Standard Bank uses "DD MMM YY" (e.g., 16 Oct 23)
//     const regex = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}\b/g;
//     return text.match(regex) || [];
//   },

//   "Tyme Bank": (text) => {
//     // Tyme Bank uses "DD MMM YYYY"
//     const regex = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\b/g;
//     return text.match(regex) || [];
//   },
// };

// export default BankDatesRules;

  
// Bank date formats
// 2021-11-28 - absa f1
// 28/07/2023 - absa f2
// 01/02/2024 01/02/2024 - captiec  
// 30 Jan - fnb 
// 04/03/2024 - ned
// 16 Oct 23 - standard
// 01 Apr 2024 tyme

// const months = {
//   Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
//   Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
//   Jan: "01", Feb: "02", Mar: "03", Apr: "04", Mei: "05", Jun: "06",
//   Jul: "07", Aug: "08", Sep: "09", Okt: "10", Nov: "11", Des: "12",
// };


// const BankDatesRules = {
//   "Absa Bank": (text) => text.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/g) || [],
//   "Capitec Bank": (text) => text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [],
//   "Fnb Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g) || [],
//   "Ned Bank": (text) => text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [],
//   "Standard Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}\b/g) || [],
//   "Tyme Bank": (text) => text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\b/g) || [],
// };

// src/components/Extract/BankDatesRules.js

const BankDatesRules = {
  "Absa Bank": (text) => {
    // console.log("Absa Bank rule used on text:", text);
    return text.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{2}\/\d{4})\b/g) || [];
  },

  "Capitec Bank": (text) => {
    // console.log("Capitec Bank rule used on text:", text);
    return text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [];
  },

  "Fnb Bank": (text) => {
    // console.log("FNB Bank rule used on text:", text);
    return text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g) || [];
  },

  "Ned Bank": (text) => {
    // console.log("Ned Bank rule used on text:", text);
    return text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || [];
  },

  "Standard Bank": (text) => {
    // console.log("Standard Bank rule used on text:", text);
    return text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}|\d{1,2} (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/g) || [];
  },

  "Tyme Bank": (text) => {
    // console.log("Tyme Bank rule used on text:", text);
    return text.match(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\b/g) || [];
  },
};

export default BankDatesRules;
