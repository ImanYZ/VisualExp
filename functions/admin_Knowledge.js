// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Creates a client using Application Default Credentials
const storage = new Storage();

// The Firebase Admin SDK to access Firestore.
let admin = require("firebase-admin");

const serviceAccount = require("./onecademy-dev-firebase-adminsdk-91m0g-0f326557b6.json");

admin = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "onecademy"
);

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
let writeCounts = 0;
let batch = db.batch();
let isCommitting = false;

// Commit and reset batchWrites and the counter.
const makeCommitBatch = async () => {
  console.log("makeCommitBatch");
  if (!isCommitting) {
    isCommitting = true;
    await batch.commit();
    writeCounts = 0;
    batch = db.batch();
    isCommitting = false;
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        isCommitting = true;
        await batch.commit();
        writeCounts = 0;
        batch = db.batch();
        isCommitting = false;
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
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
  if (!isCommitting) {
    batch.set(docRef, docData);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.set(docRef, docData);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

const batchUpdate = async (docRef, docData) => {
  if (!isCommitting) {
    batch.update(docRef, docData);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.update(docRef, docData);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

const batchDelete = async (docRef) => {
  if (!isCommitting) {
    batch.delete(docRef);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.delete(docRef);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
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
