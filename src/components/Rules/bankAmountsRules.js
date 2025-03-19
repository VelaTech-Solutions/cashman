const bankAmountsRules = {
  // ✅ Extracts amounts using regex and ensures it's always an array
  extractAmountsFromText: (text) => {
    const regex = /(\s?\-?\d*\.\d{2})/g;
    const amounts = text.match(regex) || [];
    return amounts;

  },

  "Absa Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    if (amounts.length < 3) amounts.unshift("0.00"); // Ensure "0.00" is added in front
    return [amounts[0], amounts[1], amounts[2]]; // Fees, Debit/Credit, Balance 
    },

  "Capitec Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    if (amounts.length < 3) amounts.unshift("0.00"); // Ensure "0.00" is added in front
    return [amounts[0], amounts[1], amounts[2]]; // Fees, Debit/Credit, Balance
  },

  "Standard Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    if (amounts.length < 3) amounts.unshift("0.00"); // Ensure "0.00" is added in front
    return [amounts[0], amounts[1], amounts[2]]; // Fees, Debit/Credit, Balance 
    },

  "Ned Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    if (amounts.length < 3) amounts.unshift("0.00"); // Ensure "0.00" is added in front
    return [amounts[0], amounts[1], amounts[2]]; // Balance, Debit/Credit
  },

  "Fnb Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    if (amounts.length > 3) amounts.unshift("0.00"); // Add "0.00" if only two amounts exist
    return [amounts[2], amounts[0], amounts[1]]; // Debit/Credit, Balance, Fees
  },

  "Tyme Bank": (text) => {
    return bankAmountsRules.extractAmountsFromText(text); // No reordering needed
  }
};

export default bankAmountsRules;
