const bankRules = {
    "Ned Bank": (amounts) => {
      if (amounts.length === 1) return ["0.00", "0.00", ...amounts]; // Balance only case
      if (amounts.length === 2) return ["0.00", ...amounts]; // Debit/Credit + Balance case
      return amounts; // Already correct if 3
    },
  
    "Absa Bank": (amounts) => {
      if (amounts.length === 1) return ["0.00", "0.00", ...amounts]; 
      if (amounts.length === 2) return ["0.00", ...amounts]; 
      return amounts;
    },
  
    "Fnb Bank": (amounts) => {
      if (!amounts || amounts.length === 0) return amounts; 
      if (amounts.length === 1) return [...amounts, "0.00", "0.00"]; // If only one amount, add two "0.00"
      if (amounts.length === 2) return [...amounts, "0.00"]; // If two amounts, add one "0.00"
      return amounts; // If already three amounts, return as is
    },
  
    "Capitec Bank": (amounts) => {
      return amounts; // TODO: Adjust zero placements
    },
  
    "Standard Bank": (amounts) => {
      return amounts; // TODO: Adjust zero placements
    },
  
    "Tyme Bank": (amounts) => {
      return amounts; // TODO: Adjust zero placements
    }
  };
  
  export default bankRules;
  