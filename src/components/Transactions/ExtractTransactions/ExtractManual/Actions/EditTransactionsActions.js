


const handleToggleRow = (index) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.has(index) ? newSelected.delete(index) : newSelected.add(index);
      return newSelected;
    });
  };

  const handleDeleteSelected = async () => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }

    const updatedTransactions = transactions.filter((_, index) => !selectedRows.has(index));
    const removedItems = transactions.filter((_, index) => selectedRows.has(index));

    try {
      await updateDoc(doc(db, "clients", id), { filteredData: updatedTransactions });

      const bankRef = doc(db, "banks", clientData.bankName);
      const bankSnapshot = await getDoc(bankRef);

      let ignoredLines = bankSnapshot.exists() ? bankSnapshot.data().ignoredLines || [] : [];

      const newIgnoredLines = [...new Set([...ignoredLines, ...removedItems])];

      await setDoc(bankRef, { ignoredLines: newIgnoredLines }, { merge: true });

      setTransactions(updatedTransactions);
      setRemovedTransactions((prev) => [...prev, ...removedItems]);
      setSelectedRows(new Set());
      setIgnoredCount(newIgnoredLines.length);
      setSuccessMessage(`Deleted ${removedItems.length} transactions and added them to ignored lines.`);
    } catch (err) {
      console.error("Error updating transactions:", err);
      setError("Failed to update transactions.");
    }
  };

  const handleRemoveIgnoredLines = async () => {
    if (!selectedBank) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }

    if (!ignoredLines.length && !fuzzyIgnoredLines.length) {
      setError("No ignored lines found for this bank.");
      return;
    }

    const normalizeLine = (line) => line.replace(/Page \d+ of \d+/i, "").trim();
    
    let updatedTransactions = [...transactions];
    let removedMatches = [];
    let removedFuzzyMatches = [];

    updatedTransactions = updatedTransactions.filter((transaction) => {
      const match = ignoredLines.includes(transaction);
      if (match) removedMatches.push(transaction);
      return !match;
    });

    if (fuzzyMode) {
      updatedTransactions = updatedTransactions.filter((transaction) => {
        const normalizedTransaction = normalizeLine(transaction);
        const match = fuzzyIgnoredLines.some((fuzzyLine) =>
          normalizedTransaction.toLowerCase().includes(normalizeLine(fuzzyLine).toLowerCase())
        );
        if (match) removedFuzzyMatches.push(transaction);
        return !match;
      });
    }

    try {
      const clientRef = doc(db, "clients", id);
      await updateDoc(clientRef, { filteredData: updatedTransactions });
      
      setTransactions(updatedTransactions);
      setRemovedTransactions((prev) => [...prev, ...removedMatches, ...removedFuzzyMatches]);
      setIgnoredCount(removedMatches.length);
      setFuzzyIgnoredCount(removedFuzzyMatches.length);
      setSuccessMessage(`Removed ${removedMatches.length} ignored lines and ${removedFuzzyMatches.length} fuzzy ignored lines.`);
    } catch (err) {
      console.error("Error updating transactions in Firestore:", err);
      setError("Failed to update transactions in Firestore.");
    }
  };

  const handleAlignTransactions = async () => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }
  
    const amountRegex = /\d+\.\d{2}/; // Detects amounts (e.g., 105.00)
    let formattedTransactions = [];
    let currentTransaction = [];
  
    transactions.forEach((line) => {
      if (amountRegex.test(line)) {
        // If an amount is found, push the previous transaction and start a new one
        if (currentTransaction.length > 0) {
          formattedTransactions.push(currentTransaction.join(" ")); 
        }
        currentTransaction = [line]; // Start a new transaction
      } else {
        currentTransaction.push(line); // Append additional details
      }
    });
  
    if (currentTransaction.length > 0) {
      formattedTransactions.push(currentTransaction.join(" ")); // Add last transaction
    }
  
    try {
      await updateDoc(doc(db, "clients", id), { filteredData: formattedTransactions });
      setTransactions(formattedTransactions);
      setSuccessMessage("Transactions aligned successfully!");
    } catch (err) {
      console.error("Error aligning transactions:", err);
      setError("Failed to align transactions.");
    }
  };

  const handleTransactionChange = async (index, newValue) => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }
  
    // Update local state
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = newValue;
    setTransactions(updatedTransactions);
  
    try {
      // Update Firestore
      await updateDoc(doc(db, "clients", id), { filteredData: updatedTransactions });
  
      setSuccessMessage("Transaction updated successfully.");
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction.");
    }
  };
  
  // handle save to fielsd transactions save the line as original
  const handlesavetransactions = async () => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }
  
    try {
      const transformedTransactions = transactions.map((transactionStr) => ({
        original: transactionStr,
        date1: null,
        date2: null,
        description: "",
        debit_amount: null,
        credit_amount: null,
        balance_amount: null,
        fees_amount: null,
        fees_type: null,
        category: "",
        subcategory: "",
        verified: "❌",
        credit_debit_amount: null,
      }));
  
      await updateDoc(doc(db, "clients", id), {
        transactions: transformedTransactions,
      });
  
      setSuccessMessage("Transactions saved successfully!");
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to save transactions.");
    }
  };
  
  
  // Handle transaction reset to reset the transaction to original rawData user to confirm reset i want to add this
  const handleTransactionReset = async () => {
    if (!id) {
      setError("Client ID is missing.");
      return;
    }
  
    try {
      const clientRef = doc(db, "clients", id);
      const clientSnapshot = await getDoc(clientRef);
  
      if (clientSnapshot.exists()) {
        const clientData = clientSnapshot.data();
        const rawData = clientData.rawData || []; // Assuming 'rawData' is the original array of lines
  
        if (!rawData.length) {
          setError("No original raw data available to reset.");
          return;
        }

        // confirm with user before reset
        const confirmReset = window.confirm(
          "Are you sure you want to reset transactions to the original raw data? This action cannot be undone."
        );
  
        await updateDoc(clientRef, { filteredData: rawData });
  
        setTransactions(rawData);
        setSuccessMessage("Transactions reset to original raw data.");
      } else {
        setError("Client data not found.");
      }
    } catch (err) {
      console.error("Error resetting transactions:", err);
      setError("Failed to reset transactions.");
    }
  };
  


  // Handle Auto Clean Transactions use bank name to identify which bank to clean using /BankCleanRules.js
  const handleAutoCleanTransactions = async () => {
    if (!clientData?.bankName) {
      setError("Bank name is missing. Cannot proceed.");
      return;
    }
  
    const bankName = clientData.bankName;
    const cleanFunction = BankCleanRules[bankName];
  
    if (!cleanFunction) {
      setError(`No cleaning rules found for ${bankName}`);
      return;
    }
  
    try {
      const cleanedTransactions = cleanFunction(transactions);
      await updateDoc(doc(db, "clients", id), { filteredData: cleanedTransactions });
  
      setTransactions(cleanedTransactions);
      setSuccessMessage(`Transactions auto-cleaned successfully for ${bankName}`);
    } catch (err) {
      console.error("Error auto-cleaning transactions:", err);
      setError("Failed to auto-clean transactions.");
    }
  };





          {/* Button Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Extract Description */}

          {/* Delete Selected */}
          <Button 
            text="Delete Selected" 
            small 
            onClick={handleDeleteSelected} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" 
            disabled={selectedRows.size === 0} 
          />

          {/* Reset Transactions */}
          <Button 
            text="Reset" 
            small 
           onClick={handleTransactionReset} 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          />

          {/* Auto Clean Transactions  Auto clean links with BankCleanRules.js and the bank name */}
          <Button 
            text="Auto Clean" 
            small 
            onClick={handleAutoCleanTransactions} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" 
          />

          {/* Save and create field transactions */}
          <Button 
            text="Save Transactions" 
            small 
            onClick={handlesavetransactions} 
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" 
          />

          {/* Align Transactions */}
          <Button 
            text="Align Transactions" 
            small 
            onClick={handleAlignTransactions} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" 
          />


          {/* Fuzzy Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Normal</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={fuzzyMode}
                onChange={() => setFuzzyMode(!fuzzyMode)}
              />
              <div className="w-10 h-5 bg-gray-400 rounded-full peer-checked:bg-blue-600 transition relative 
                  after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white 
                  after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
            <span className="text-white text-sm">Fuzzy</span>
          </div>

          {/* Remove Ignored Lines */}
          <Button
            text={`Remove Ignored Lines (${ignoredCount}) / Fuzzy Ignored Lines (${fuzzyIgnoredCount})`}
            onClick={handleRemoveIgnoredLines}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            disabled={ignoredLines.length === 0 && fuzzyIgnoredLines.length === 0}
          />

        </div>
      </div>

        {/* Success & Error Messages */}
        {successMessage && <p className="text-green-500 p-2">{successMessage}</p>}
        {error && <p className="text-red-500 p-2">{error}</p>}