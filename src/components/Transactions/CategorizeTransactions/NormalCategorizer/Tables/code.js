
        {/* Category */}
        {/* <select
          value={category}
          onChange={(e) => {
            const val = e.target.value;
            console.log("🟡 Category selected:", val);
            setCategory(val);
          }}
          className="p-2 text-sm rounded bg-gray-700 text-white"
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select> */}
        {/* Subcategory */}
        {/* <select
          value={subcategory}
          onChange={(e) => {
            const val = e.target.value;
            console.log("🟡 Subcategory selected:", val);
            setSubcategory(val);
          }}
          className="p-2 text-sm rounded bg-gray-700 text-white"
        >
          <option value="">Subcategory</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.name}>{sub.name}</option>
          ))}
        </select> */}

        <button
          onClick={() => {
            console.log("🟢 Categorize clicked");
            console.log("📌 Current Category:", category);
            console.log("📌 Current Subcategory:", subcategory);
            console.log("📌 Transactions to categorize:", selectedTransactions);
            selectedTransactions.forEach((t, i) => {
              console.log(`🔹 Transaction ${i}:`, t);
            });
            selectedTransactions.forEach((t) =>
              handleCategorize(clientId, category, subcategory, t)
            );
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-xs rounded"
        >
          📂 Categorize
        </button>

        <button
          onClick={() => {
            console.log("🛑 Clear selected transactions");
            setSelectedTransactions([]);
          }}
          className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs rounded"
        >
          ❌ Clear
        </button>
      </div>

        const Dropdown = ({ label, value, onChange, items, placeholder }) => (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'white' }}>{label}</InputLabel>
            <Select
              value={value}
              label={label}
              onChange={onChange}
              sx={{
                backgroundColor: '#333',
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover': { backgroundColor: '#444' },
                '&.Mui-focused': { backgroundColor: '#444', borderColor: '#6cace4' },
              }}
            >
              <MenuItem value="">{placeholder}</MenuItem>
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      





      <div className="flex border-b border-gray-700 mb-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          {/* Select Cat */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                setCategory(selectedCategoryId);
                const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
                setSubcategory("");
              }}
              sx={selectSx}
            >
              <MenuItem value="">Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Select Subcat */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'white' }}>Subcategory</InputLabel>
            <Select
              label="Subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              sx={selectSx}
            >
              <MenuItem value="">Subcategory</MenuItem>
              {subcategories.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCategorizeClick}
            disabled={selectedTransactions.length === 0}
            startIcon={<span>📂</span>}
          >
            Categorize
          </Button>
          {/* <button
            // onClick={}
            disabled={selectedTransactions.length === 0}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Check Category Match
          </button>

          <button
            onClick={handleClearCategorized}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Reset Category
          </button>
          
          {/* testing this now so so working*/}
          {/*<button
            onClick={handleCategorizeClick}
            disabled={selectedTransactions.length === 0}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-semibold"
          >
            Categorize Transaction
          </button> */}
        </Box>
        </div>
      </div>




  const isGroupFullySelected = (groupKey) => {
    const groupItems = currentItems.filter(item => item.groupKey === groupKey && !item.isHeader);
    return groupItems.every(item => selectedTransactions.includes(item.uid));
  };
  
  const handleToggleGroup = (groupKey) => {
    const groupItems = currentItems.filter(item => item.groupKey === groupKey && !item.isHeader);
    const groupUids = groupItems.map(item => item.uid);
  
    const isFullySelected = groupUids.every(uid => selectedTransactions.includes(uid));
  
    setSelectedTransactions(prev => {
      if (isFullySelected) {
        return prev.filter(uid => !groupUids.includes(uid));
      } else {
        return [...prev, ...groupUids.filter(uid => !prev.includes(uid))];
      }
    });
  };



  // Group transactions by category or description
  const toggleGroupBy = () => {
    setGroupBy((prev) => (prev === "category" ? "description" : "category"));
    setCurrentPage(1);
  };


      {/* Group By Button */}
      {/* <div className="flex items-center gap-2 pr-2">
        <span className="text-sm text-gray-400">Group by:</span>
        <button
          onClick={toggleGroupBy}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-cyan-400 border border-cyan-500"
        >
          {groupBy === "category" ? "Category" : "Description"}
        </button>
      </div> */}
      {/* Progress Text */}
      {/* <div className="w-full text-left">
        <span className="text-sm font-semibold text-white">
          {Math.round(progress)}% Categorized
        </span>
      </div> */}