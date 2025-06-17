//Controller.js

// Firebase Imports
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../../firebase/firebase";

import { createDatabaseStructure } from '../../Utils';

import { extractRawData as extractRawDataA } from './TypeA/Step1';
import { extractRawData as extractRawDataB } from './TypeB/Step1';

import filterStatementA from './TypeA/filterStatement';
import filterStatementB from './TypeB/filterStatement';

import cleanStatementA from './TypeA/cleanStatement';
import cleanStatementB from './TypeB/cleanStatement';

import extractDatesA from './TypeA/extractDates';
import extractDatesB from './TypeB/extractDates';

import extractDatesVerifyA from './TypeA/extractDatesVerify';
import extractDatesVerifyB from './TypeB/extractDatesVerify';

import extractAmountsA from './TypeA/extractAmounts';
import extractAmountsB from './TypeB/extractAmounts';

import extractAmountsVerifyA from './TypeA/extractAmountsVerify';
import extractAmountsVerifyB from './TypeB/extractAmountsVerify';

import extractAmountsVerify2A from './TypeA/extractAmountsVerify2';
import extractAmountsVerify2B from './TypeB/extractAmountsVerify2';

import extractDescriptionA from './TypeA/extractDescription';
import extractDescriptionB from './TypeB/extractDescription';

import extractDescriptionVerifyA from './TypeA/extractDescriptionVerify';
import extractDescriptionVerifyB from './TypeB/extractDescriptionVerify';

import verifyDatabaseA from './TypeA/verifyDatabase';
import verifyDatabaseB from './TypeB/verifyDatabase';

const extractAbsaData = async (clientId, clientData, bankName, method) => {
  // const type = clientData?.bankType;
  const type = clientData?.bankType?.replace(/\s/g, ''); // 'Type A' -> 'TypeA'
  if (!clientId || !clientData || !bankName || !method || !type) {
    console.error("❌ Missing required parameters");
    return false;
  }

  console.log("Type", type)

  await createDatabaseStructure(clientId);

  const extractRawDataFn = type === 'TypeA' ? extractRawDataA : extractRawDataB;
  const filterStatementFn = type === 'TypeA' ? filterStatementA : filterStatementB;
  const cleanStatementFn = type === 'TypeA' ? cleanStatementA : cleanStatementB;
  const extractDatesFn = type === 'TypeA' ? extractDatesA : extractDatesB;
  const extractDatesVerifyFn = type === 'TypeA' ? extractDatesVerifyA : extractDatesVerifyB;
  const extractAmountsFn = type === 'TypeA' ? extractAmountsA : extractAmountsB;
  const extractAmountsVerifyFn = type === 'TypeA' ? extractAmountsVerifyA : extractAmountsVerifyB;
  const extractAmountsVerify2Fn = type === 'TypeA' ? extractAmountsVerify2A : extractAmountsVerify2B;
  const extractDescriptionFn = type === 'TypeA' ? extractDescriptionA : extractDescriptionB;
  const extractDescriptionVerifyFn = type === 'TypeA' ? extractDescriptionVerifyA : extractDescriptionVerifyB;
  const verifyDatabaseFn = type === 'TypeA' ? verifyDatabaseA : verifyDatabaseB;

  if (!clientData?.rawData) {
    const success = await extractRawDataFn(clientId, bankName, method);
    console.log('extractRawData result:', success);
    if (!success) {
      console.error('❌ Extraction failed');
      return;
    }
  } else {
    console.log("⚠️ rawData already exists. Skipping raw extraction step.");
    try {
      await updateDoc(doc(db, "clients", clientId), { filteredData: clientData.rawData });
    } catch (error) {
      console.error('❌ Failed to update document:', error);
    }
  }

  await filterStatementFn({ clientId, bankName, type });
  await cleanStatementFn({ clientId, bankName, type });
  await extractDatesFn( clientId, bankName, type );
  await extractDatesVerifyFn( clientId, bankName, type );
  await extractAmountsFn( clientId, bankName, type );
  await extractAmountsVerifyFn( clientId, bankName, type );
  // await extractAmountsVerify2Fn( clientId, bankName, type );
  await extractDescriptionFn( clientId, bankName, type );
  await extractDescriptionVerifyFn( clientId, bankName, type );
  await verifyDatabaseFn( clientId, bankName, type );
};

export { extractAbsaData };
