// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client using Application Default Credentials
const storage = new Storage();

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Firestore does not accept more than 500 writes in a transaction or batch write.
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

// How many transactions/batchWrites out of 500 so far.
// I wrote the following functions to easily use batchWrites wthout worrying about the 500 limit.
let batch = db.batch();
let writeCounts = 0;

// Commit and reset batchWrites and the counter.
const makeCommitBatch = async () => {
  await batch.commit();
  batch = db.batch();
  writeCounts = 0;
};

// Commit the batchWrite; if you got a Firestore Deadline Error try again every 4 seconds until it gets resolved.
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

//  If the batchWrite exeeds 499 possible writes, commit and rest the batch object and the counter.
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
