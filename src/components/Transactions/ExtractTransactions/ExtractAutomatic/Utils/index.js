// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/index.js


// Step 1: Create Database Structure
export { default as createDatabaseStructure } from './createDatabaseStructure';

// Step 2: Clean Statement
export { default as cleanStatement } from './cleanStatement';

// Step 3: Extract Dates
export { default as extractDates } from './extractDates';
export { default as extractDatesVerify } from './extractDatesVerify';

// Step 4: Extract Amounts
export { default as extractAmounts } from './extractAmounts';
export { default as extractAmountsVerify } from './extractAmountsVerify';
export { default as extractAmountsVerify2 } from './extractAmountsVerify2';

// Step 5: Extract Descriptions
export { default as extractDescription } from './extractDescription';
export { default as extractDescriptionVerify } from './extractDescriptionVerify';

// Step 6: Verify Transactions
export { default as removeNotTransactions } from './removeNotTransactions';


// Final Aggregator
export { default as ExtractionProcess } from './ExtractionProcess';


export { default as ProgressUtils } from './ProgressUtils';

// Notes on Steps:
// 1. Create Database Structure
// 2. Clean Statement
// 3. Extract Dates
// 3.1 Verify Dates
// 4. Extract Amounts
// 4.1 Verify Amounts
// 4.2 Verify Amounts
// 5. Extract Descriptions
// 5.1 Verify Descriptions