Absa Type A
Date Transaction Description Amount Balance

Absa Type B
Date Transaction Description Charge Debit Amount Credit Amount Balance

Capitec Type A
PostingDate Transaction Date Description MoneyIn(R) MoneyOut(R) Balance(R)

Capitec Type B
Date Description Category Money In Money Out Fee* Balance

Fnb Type A
Date Description Amount Balance Accrued Bank Charges

Ned Type A
Tranlistno Date Description Fees(R) Debits(R) Credits(R) Balance(R)

Standard Type A
Date Description Payments Deposits Balance

Tyme Type A
Date Description Fees Money Out Money In Balance

___________________________________________________________________________________

Absa Type A
Date | Transaction Description | Amount | Balance

Absa Type B
Date | Transaction Description | Charge Debit | Amount Credit | Amount Balance

Capitec Type A
PostingDate | Transaction Date | Description | MoneyIn(R) | MoneyOut(R) | Balance(R)

Capitec Type B
Date | Description | Category | Money In | Money Out | Fee* | Balance

Fnb Type A
Date | Description | Amount | Balance | Accrued Bank Charges

Ned Type A
Tranlistno | Date | Description | Fees(R) | Debits(R) | Credits(R) | Balance(R)

Standard Type A
Date | Description | Payments | Deposits | Balance

Tyme Type A
Date | Description | Fees | Money Out | Money In | Balance
___________________________________________________________________________________

Absa Type A
Date | Transaction Description | Amount | Balance
date regex = /(\d{4}-\d{2}-\d{2})/g;
const regex = /(\-?\r\d*\s?\d*\.\d{2})/g;
only have 2 amounts credit/debit | Balance


Absa Type B
Date | Transaction Description | Charge Debit | Amount Credit | Amount Balance
date regex = /(\d{1,2}\/\d{2}\/\d{4})/g;
const regex = /(\d*\s?\d*\.\d{2})/g;
// Ensure "0.00" is added infront
if 3 amounts found its a Fee | credit/debit | Balance


Capitec Type A
PostingDate | Transaction Date | Description | MoneyIn(R) | MoneyOut(R) | Balance(R)
date regex = /(\d{2}\/\d{2}\/\d{4})/g;
const regex = /(\-?\d*\s?\d*\.\d{2})/g;
only have 2 amounts credit/debit | Balance


Capitec Type B
Date | Description | Category | Money In | Money Out | Fee* | Balance
date regex = /(\d{2}\/\d{2}\/\d{4})/g;
const regex = /(\-?\d*\s?\d*\.\d{2})/g;
if 3 amounts found its a credit/debit | Fee | Balance
so insert "0.00" when 2 amounts are found between the 2 amounts
**** i also see that Capitec Type if there is a Fee amount it deducts immditly


Fnb Type A
Date | Description | Amount | Balance | Accrued Bank Charges
date regex = /(\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/g;
date regex = /(\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/g; change this to afrikaans later
const regex = /(\d*\,?\d*\.\d{2})/g;
// Add "0.00" if only two amounts exist
credit/debit | Balance | Fee


Ned Type A
Tranlistno | Date | Description | Fees(R) | Debits(R) | Credits(R) | Balance(R)
date regex = /(\d{2}\/\d{2}\/\d{4})/g;
const regex = /(\d*\,?\d*\.\d{2})/g;
only have 2 amounts credit/debit | Balance


Standard Type A
Date | Description | Payments | Deposits | Balance
date regex = /(\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) \d{2}|\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/g;

const regex = /(\-?\d*\,?\d*\.\d{2})/g;
only have 2 amounts credit/debit | Balance


Tyme Type A
Date | Description | Fees | Money Out | Money In | Balance
date regex = /(\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) \d{4})/g;
const regex = /(\-?\d*\s?\d*\.\d{2})/g;
only have 2 amounts credit/debit/fee | Balance