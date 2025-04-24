// tableUtils.js

// Function to handle sorting
export const sortItemsByDate = (items, sortAsc) => {
    return items.sort((a, b) => {
      const dateA = new Date(a.date1);
      const dateB = new Date(b.date1);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  };
  
  // Function to filter valid transactions
  export const filterValidTransactions = (txns) => {
    return txns.filter(
      (txn) =>
        txn.date1 &&
        (txn.credit_amount || txn.debit_amount || txn.balance_amount)
    );
  };
  
  // Function to handle pagination logic
  export const paginateItems = (items, currentPage, rowsPerPage) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return items.slice(startIndex, startIndex + rowsPerPage);
  };
  
  // Function to group transactions
  export const groupTransactions = (transactions, groupBy) => {
    const grouped = transactions.reduce((acc, txn) => {
      const key =
        groupBy === "description"
          ? txn.description || "No Description"
          : txn.category || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {});
  
    let flat = [];
    Object.entries(grouped).forEach(([groupKey, txns]) => {
      flat.push({ isHeader: true, groupKey });
      flat.push(...txns);
    });
  
    return flat;
  };
  
  // Function to handle select all logic
  export const toggleSelectAll = (currentItems, selectedTransactions, setSelectedTransactions) => {
    const uids = currentItems.filter((i) => !i.isHeader).map((i) => i.uid);
    const isAllSelected = uids.every((uid) => selectedTransactions.includes(uid));
    const newSelections = isAllSelected
      ? selectedTransactions.filter((uid) => !uids.includes(uid))
      : [...selectedTransactions, ...uids.filter((uid) => !selectedTransactions.includes(uid))];
    setSelectedTransactions(newSelections);
  };
  
  // Header definitions
  export const tableHeaders = [
    { label: "Date", key: "date1" },
    { label: "Description", key: "description" },
    { label: "Description2", key: "description2" },
    { label: "Credit", key: "credit_amount" },
    { label: "Debit", key: "debit_amount" },
    { label: "Balance", key: "balance_amount" },
    { label: "Category", key: "category" },
    { label: "Subcategory", key: "subcategory" }
  ];
  

  
  export const renderRow = (item, idx, groupBy = "default") => {
    if (item.isHeader) {
      return (
        <tr key={`header-${item.groupKey}`} className="bg-gray-900 border-t border-gray-700">
          <td colSpan={9} className="p-3 font-semibold text-cyan-400">
            {groupBy === "default" ? `Default: ${item.groupKey}` : `Description: ${item.groupKey}`}
          </td>
        </tr>
      );
    }
  
    return (
      <tr key={item.uid || idx} className="border-t border-gray-700 hover:bg-gray-700/30">
        {renderRowContent(item)}
      </tr>
    );
  };
  
  // This function is responsible for rendering the content inside the row (without selection or header logic)
    export const renderRowContent = (item) => {
        return (
        <>
            <td className="p-3">{item.date1 || "-"}</td>
            <td className="p-3">{item.description || "-"}</td>
            <td className="p-3">{item.description2 || "-"}</td>
            <td className="p-3">{item.credit_amount || "-"}</td>
            <td className="p-3">{item.debit_amount || "-"}</td>
            <td className="p-3">{item.balance_amount || "-"}</td>
            <td className="p-3">{item.category || "-"}</td>
            <td className={`p-3 ${CategoryColor.getCategoryColor(item.category)}`}>
            {item.subcategory || "-"}
            </td>
        </>
        );
    };
    
    // export const handleSelectAll = () => {
    //     const uids = currentItems.filter((i) => !i.isHeader).map((i) => i.uid);
    //     if (isAllSelected) {
    //       setSelectedTransactions(selectedTransactions.filter((uid) => !uids.includes(uid)));
    //     } else {
    //       const newSelections = [...selectedTransactions, ...uids.filter((uid) => !selectedTransactions.includes(uid))];
    //       setSelectedTransactions(newSelections);
    //     }
    //   };
    
    