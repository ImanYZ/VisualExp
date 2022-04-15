// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client using Application Default Credentials
const storage = new Storage();

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const MAX_TRANSACTION_WRITES = 499;

const isFirestoreDeadlineError = (err) => {
  console.log({ err });
  const errString = err.toString();
  return (
    errString.includes("Error: 13 INTERNAL: Received RST_STREAM") ||
    errString.includes("Error: 4 DEADLINE_EXCEEDED: Deadline exceeded")
  );
};

const db = admin.firestore();
let batch = db.batch();
let writeCounts = 0;

const makeCommitBatch = async () => {
  await batch.commit();
  batch = db.batch();
  writeCounts = 0;
};

const commitBatch = async () => {
  try {
    await makeCommitBatch();
  } catch (err) {
    console.log({ err });
    if (isFirestoreDeadlineError(err)) {
      const theInterval = setInterval(async () => {
        try {
          await makeCommitBatch();
          clearInterval(theInterval);
        } catch (err) {
          console.log({ err });
          if (!isFirestoreDeadlineError(err)) {
            clearInterval(theInterval);
            throw err;
          }
        }
      }, 4000);
    }
  }
};

const checkRestartBatchWriteCounts = async () => {
  writeCounts += 1;
  if (writeCounts >= MAX_TRANSACTION_WRITES) {
    await commitBatch();
  }
};

const batchSet = async (docRef, docData) => {
  batch.set(docRef, docData);
  await checkRestartBatchWriteCounts();
};

const batchUpdate = async (docRef, docData) => {
  batch.update(docRef, docData);
  await checkRestartBatchWriteCounts();
};

const batchDelete = async (docRef) => {
  batch.delete(docRef);
  await checkRestartBatchWriteCounts();
};

module.exports = {
  admin,
  db,
  MAX_TRANSACTION_WRITES,
  checkRestartBatchWriteCounts,
  commitBatch,
  isFirestoreDeadlineError,
  batchSet,
  batchUpdate,
  batchDelete,
  storage,
};
