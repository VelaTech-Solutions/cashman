//  Import  Component and Functions
// Banks/ /Controller.js

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../firebase/firebase";


import { createDatabaseStructure } from '../../Utils';

import { extractRawData } from './Step1';

import filterStatement  from './filterStatement';
import cleanStatement  from './cleanStatement';

import extractDates  from './extractDates';
import extractDatesVerify  from './extractDatesVerify';

import extractAmounts  from './extractAmounts';
import extractAmountsVerify  from './extractAmountsVerify';
import extractAmountsVerify2  from './extractAmountsVerify2';

import extractDescription  from './extractDescription';
import extractDescriptionVerify  from './extractDescriptionVerify';

import verifyDatabase  from './verifyDatabase';


// export with your preferred name
const extractCapitecData = async (clientId, clientData, setClientData, bankName, method) => {
  if (!clientId || !clientData || !bankName || !method) {
    console.error("❌ Missing required parameters");
    return false;
  }
  // console.log(clientId);
  await createDatabaseStructure(clientId);

  // Check if rawData already exists inside clientData
  if (!clientData.rawData) {
    const success = await extractRawData(clientId, bankName, method);
    if (success) {
      console.log('✅ Extraction started successfully');
    } else {
      console.error('❌ Extraction failed');
    }
  } else {
    console.log("⚠️ rawData already exists. Skipping raw extraction step.");
    await updateDoc(doc(db, "clients", clientId), { filteredData: clientData.rawData });
  }

  await filterStatement({ clientId, bankName});

  await cleanStatement({ clientId, bankName });

  await extractDates(clientId, bankName);

  await extractDatesVerify(clientId, bankName);

  await extractAmounts(clientId, bankName);

  await extractAmountsVerify(clientId, bankName);

  await extractAmountsVerify2(clientId, bankName);
  
  await extractDescription(clientId, bankName);

  await extractDescriptionVerify(clientId, bankName);

  await verifyDatabase(clientId, bankName);

};

export { extractCapitecData };
