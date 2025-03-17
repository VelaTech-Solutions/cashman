const bankAmountsRules = {
  // ✅ Extracts amounts using regex and ensures it's always an array
  extractAmountsFromText: (text) => {
    const regex = /(\s?\-?\d*\.\d{2})/g;
    const extracted = [...text.matchAll(regex)].map(match => match[0].trim());

    // Ensure at least three values (fees, debit/credit, balance)
    while (extracted.length < 3) {
      extracted.push("0.00");
    }
    return extracted;
  },

  "Absa Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    return [amounts[2], amounts[0], amounts[1]]; // Fees, Debit/Credit, Balance
  },

  "Capitec Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    return [amounts[2], amounts[0], amounts[1]]; // Fees, Debit/Credit, Balance
  },

  "Standard Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    return [amounts[2], amounts[1], amounts[0]]; // Balance, Debit/Credit
  },

  "Ned Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    return [amounts[2], amounts[1], amounts[0]]; // Balance, Debit/Credit
  },

  "Fnb Bank": (text) => {
    let amounts = bankAmountsRules.extractAmountsFromText(text);
    return [amounts[1], amounts[2], amounts[0]]; // Debit/Credit, Balance, Fees
  },

  "Tyme Bank": (text) => {
    return bankAmountsRules.extractAmountsFromText(text); // No reordering needed
  }
};

export default bankAmountsRules;
