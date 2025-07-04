// src/components/Transactions/ExtractTransactions/ExtractAutomatic/Utils/index.js


// Step 1: Create Database Structure
export { default as createDatabaseStructure } from './createDatabaseStructure';

export { default as resetClientDb } from './resetClientDb';
export { default as hardResetClientDb } from './hardResetClientDb';
export { default as filterStatement } from './filterStatement';

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

// verify and/or confirm database
export { default as verifyDatabase } from './verifyDatabase';

// Final Aggregator
export { default as extractionController } from './extractionController';
// Step 6: Verify Transactions
export { default as removeNotTransactions } from './removeNotTransactions';


export { default as ProgressUtils } from './ProgressUtils';

// Notes on Steps:
// 1. Create Database Structure

// 2. filterStatement
// 2.1. Clean Statement

// 3. Extract Dates
// 3.1 Verify Dates
// 4. Extract Amounts
// 4.1 Verify Amounts
// 4.2 Verify Amounts
// 5. Extract Descriptions
// 5.1 Verify Descriptions