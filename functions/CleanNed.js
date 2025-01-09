// functions/CleanNed.js

/**
 * Cleans raw transaction data from Nedbank bank statements.
 * @param {string} rawData - The raw extracted data from the PDF or OCR.
 * @returns {Array<Object>} An array of cleaned transactions.
 */
function cleanNedData(rawData) {
  // Split the raw data into lines for easier processing
  const lines = rawData.split('\n');
  
  const transactions = [];

  // Regex patterns specific to Nedbank's format
  const datePattern = /\d{2}\/\d{2}\/\d{4}/; // Example: 04/03/2024
  const transactionPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d+\.\d{2})\s+(-?\d+\.\d{2})\s+(-?\d+\.\d{2})/;

  lines.forEach((line) => {
    // Skip empty lines or non-transactional data
    if (!line.trim() || !datePattern.test(line)) {
      return;
    }

    // Match transaction lines
    const match = line.match(transactionPattern);
    if (match) {
      const [_, date, description, fees, debits, credits, balance] = match;

      // Push the cleaned transaction into the array
      transactions.push({
        date,
        description: description.trim(),
        fees: parseFloat(fees) || 0,
        debits: parseFloat(debits) || 0,
        credits: parseFloat(credits) || 0,
        balance: parseFloat(balance) || 0,
      });
    }
  });

  return transactions;
}

// Export the cleaning function
module.exports = { cleanNedData };