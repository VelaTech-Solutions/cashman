## Automatic Transaction Extraction Process the .JS 

The automatic transaction extraction process is a multi-step procedure designed to efficiently extract and verify transaction data from statements. Below is an overview of each step involved in the process:

1. **Create Database Structure**
   - Initialize the necessary database tables and structures to store extracted transaction data.
   - Utilize the `createDatabaseStructure` function for setting up the initial database schema.

2. **Fetch and Verify Raw Statement Data**
   - Check if the `rawData` field exists in the client document.
   - If it does, copy the data to `filteredData` to ensure it is available for the extraction process.

3. **Clean Statement**
   - Pre-process the raw statement to remove any unnecessary data and standardize the format.
   - Apply the `cleanStatement` function to perform these cleaning operations.
   - We can use the dates to identify that are transactions if no date we move to archive

4. **Extract Dates**
   - Extract and parse transaction dates from the cleaned statement.
   - Use the `extractDates` function to identify and format dates correctly.
   - Optionally, verify the extracted dates with `extractDatesVerify` to ensure accuracy.
   - The Date we are looking to be normailze should be dd/mm/yyyy

5. **Extract Amounts**
   - Identify and extract monetary values from the statement.
   - Implement the `extractAmounts` function to locate and format the amounts.
   - Verify the extracted amounts using `extractAmountsVerify` and `extractAmountsVerify2` for additional validation.

6. **Extract Descriptions**
   - Extract transaction descriptions to provide context and detail.
   - Use the `extractDescription` function to capture this information.
   - Verify the accuracy of descriptions with `extractDescriptionVerify`.

7. **Verify Transactions**
   - Remove the transactions or the line that has no dates.
   - Perform a final verification step to ensure all extracted data represents valid transactions.
   - Utilize the `removeNotTransactions` function to filter out any non-transactional data.
   - Verfiy that all fields in the db schema.

8. **Final Aggregation**
   - Combine and aggregate all verified data into a comprehensive transaction dataset.
   - This step is managed by the `ExtractionProcess` function, which orchestrates the entire extraction pipeline.

Throughout the process, `ProgressUtils` can be used to monitor and update the progress of each step, ensuring transparency and tracking of the extraction workflow.

By following this structured approach, transaction data can be reliably extracted, verified, and stored for further analysis and reporting.


Still building the readme...


## Automatic Transaction Extraction Process the .TSX