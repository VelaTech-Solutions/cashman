/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// admin.initializeApp();

// exports.processBankStatement = functions.https.onCall(async (data, context) => {
//   const { clientId } = data;

//   try {
//     console.log(`Processing data for client ID: ${clientId}`);
//     // Simulate processing logic
//     return { success: true, message: `Data processed for client ID: ${clientId}` };
//   } catch (error) {
//     console.error('Error processing data:', error);
//     throw new functions.https.HttpsError('internal', 'Failed to process data.');
//   }
// });



const functions = require('firebase-functions');
const admin = require('firebase-admin');
const pdfParse = require('pdf-parse');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const storage = new Storage();

exports.processBankStatement = functions.https.onCall(async (data, context) => {
  const { clientId, filePath } = data;

  try {
    // Step 1: Download the PDF from Firebase Storage
    const bucket = storage.bucket('cashman-790ad.firebasestorage.app');
    const file = bucket.file(filePath);
    const [pdfBuffer] = await file.download();

    // Step 2: Parse the PDF using pdf-parse
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;

    // Step 3: Save the extracted text to Firestore as feild rawText
    const db = admin.firestore();
    const clientRef = db.collection('clients').doc(clientId);
    await clientRef.update({ rawText: extractedText });
    


    // Step 3: Log the extracted text and return it
    console.log(`Extracted text for client ${clientId}:`, extractedText);
    return { success: true, extractedText };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process PDF.');
  }
});
