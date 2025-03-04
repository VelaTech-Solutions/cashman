// src/components/Extract/BankCleanRules.js
// Clean line by bank name


// banks  "Absa Bank" "Capitec Bank" "Fnb Bank" "Ned Bank" "Standard Bank" "Tyme Bank"

const BankCleanRules = {

// "Absa Bank" 
"Absa Bank": (lines) => {
    // Example placeholder logic
    return lines;
  },



// "Capitec Bank" 

// From maatching starting lines remove all line until PostingDate Transaction Description MoneyIn(R) MoneyOut(R) Balance(R) this at the start only once
// This "24hrClientCareCentre0860102043EClientCare@capitecbank.co.zacapitecbank.co.za"
// From "CapitecBankisanauthorisedfinancialservices"
// 
// To "Unique Document No"
"Capitec Bank": (lines) => {
    const startIndex = lines.findIndex((line) =>
      line.includes(
        "PostingDate Transaction Description MoneyIn(R) MoneyOut(R) Balance(R)"
      )
    );
    if (startIndex === -1) return lines;
    let cleanedLines = lines.slice(startIndex + 1);

    cleanedLines = cleanedLines.filter(
      (line) =>
        !line.includes("CapitecBankisanauthorisedfinancialservices") &&
        !line.includes("Unique Document No") &&
        !line.includes(
          "24hrClientCareCentre0860102043EClientCare@capitecbank.co.zacapitecbank.co.za"
        )
    );

    cleanedLines = cleanedLines.filter((line) => line.trim() !== "");

    return cleanedLines;
    },



// "Fnb Bank" 
"Fnb Bank": (lines) => {
    // Example placeholder logic
    return lines;
  },

  
// "Ned Bank" 
"Ned Bank": (lines) => {
    const startIndex = lines.findIndex((line) =>
      line.includes(
        "Tranlistno Date Description Fees(R) Debits(R) Credits(R) Balance(R)"
      )
    );
    if (startIndex === -1) return lines;
    let cleanedLines = lines.slice(startIndex + 1);

    cleanedLines = cleanedLines.filter(
      (line) =>
        !line.includes("Page 4 of 4") &&
        !line.includes("Nedbank Customer Support")
    );

    cleanedLines = cleanedLines.filter((line) => line.trim() !== "");

    return cleanedLines;
  },


// "Standard Bank" 
"Standard Bank": (lines) => {
    // Example placeholder logic
    return lines;
  },



// "Tyme Bank"
"Tyme Bank": (lines) => {
    // Example placeholder logic
    return lines;
  },

};

export default BankCleanRules;