/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */



// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const pdfParse = require('pdf-parse');
const { Storage } = require('@google-cloud/storage');
const cors = require("cors")({ origin: true });

admin.initializeApp();
const storage = new Storage();


// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.helloWorld = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).json({ message: "Hello, World!" });
  });
});


// Function extract Text



// exports.processBankStatement = functions.https.onCall(async (data, context) => {
//   const { clientId, filePath } = data;

//   try {
//     // Step 1: Download the PDF from Firebase Storage
//     const bucket = storage.bucket('cashman-790ad.firebasestorage.app');
//     const file = bucket.file(filePath);
//     const [pdfBuffer] = await file.download();

//     // Step 2: Parse the PDF using pdf-parse
//     const pdfData = await pdfParse(pdfBuffer);
//     const extractedText = pdfData.text;

//     // Step 3: Save the extracted text to Firestore as feild rawText
//     const db = admin.firestore();
//     const clientRef = db.collection('clients').doc(clientId);
//     await clientRef.update({ rawText: extractedText });

//     // Step 3: Log the extracted text and return it
//     console.log(`Extracted text for client ${clientId}:`, extractedText);
//     return { success: true, extractedText };
//   } catch (error) {
//     console.error('Error processing PDF:', error);
//     throw new functions.https.HttpsError('internal', 'Failed to process PDF.');
//   }
// });


// exports.extractTransactions = functions.https.onRequest(async (req, res) => {
//   const { clientId, filePath } = req.body;

//   if (!clientId || !filePath) {
//     return res.status(400).send("Missing required parameters.");
//   }

//   try {
//     // Locate the file in Firebase Storage
//     const bucket = storage.bucket('cashman-790ad.firebasestorage.app');
//     const file = bucket.file(filePath);

//     // Step 1: Check if the file exists
//     const [exists] = await file.exists();
//     if (!exists) {
//       console.error("File not found:", filePath);
//       return res.status(404).send("File not found.");
//     }

//     console.log("File found:", filePath);

//     // Step 2: Download the file
//     const [fileBuffer] = await file.download();

//     // Step 3: Parse the PDF
//     const pdfData = await pdfParse(fileBuffer);
//     const rawText = pdfData.text;

//     console.log("Extracted raw text:", rawText.slice(0, 500)); // Log the first 500 chars for debugging

//     // Step 4: Save the raw data to Firestore under the `rawData` field
//     const docRef = admin.firestore().collection("raw_statements").doc(clientId);
//     await docRef.set(
//       {
//         clientId,
//         filePath,
//         rawData: rawText, // Save raw text under `rawData` field
//         timestamp: admin.firestore.FieldValue.serverTimestamp(),
//       },
//       { merge: true } // Merge with existing fields if the document exists
//     );

//     res.status(200).send({
//       message: "File processed successfully.",
//       rawData: rawText,
//     });
//   } catch (error) {
//     console.error("Error processing the file:", error);
//     res.status(500).send("Failed to process the file.");
//   }
// });
