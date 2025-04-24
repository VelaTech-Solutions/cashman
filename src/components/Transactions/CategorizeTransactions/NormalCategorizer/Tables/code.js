
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