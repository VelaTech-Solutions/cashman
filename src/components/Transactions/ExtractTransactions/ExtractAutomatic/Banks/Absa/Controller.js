//  Import Absa Component and Functions
// Banks/Absa/Controller.js


import { createDatabaseStructure } from '../../Utils';

import { extractRawData } from './Step1';
import fliterandclean  from './Step2';

// export with your preferred name
const extractAbsaData = async (clientId, clientData, bankName, method) => {
  if (!clientId || !clientData || !bankName || !method) {
    console.error("❌ Missing required parameters");
    return false;
  }

  await createDatabaseStructure(clientId);

// Check if rawData already exists inside clientData
if (clientData.rawData) {
  console.log("⚠️ rawData already exists in clientData. Skipping extraction.");
  return true;
}


  // If not, run the extraction Cloud Function
  const success = await extractRawData(clientId, bankName, method);
  if (success) {
    console.log('✅ Extraction started successfully');
  } else {
    console.error('❌ Extraction failed');
  }
  // can this just tell the main scritp to copy the raw data to filteredData
    await fliterandclean(clientId, bankName);

};

export { extractAbsaData };
