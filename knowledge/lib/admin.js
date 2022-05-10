import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// For production:
// admin.initializeApp();

require("dotenv").config();

console.log("***************************************");
console.log({ ENV: process.env });
console.log("***************************************");
const admin = global.firebaseApp
  ? global.firebaseApp
  : initializeApp(
      {
        credential: cert({
          type: "service_account",
          project_id: process.env.ONECADEMYCRED_PROJECT_ID,
          private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
          private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
          client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
          client_id: process.env.ONECADEMYCRED_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
          storageBucket: "onecademy-dev.appspot.com",
          databaseURL: "https://onecademy-dev-default-rtdb.firebaseio.com/",
        }),
      },
      "onecademy"
    );

// store on global object so we can reuse it if we attempt
// to initialize the app again
global.firebaseApp = admin;

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

const db = getFirestore(admin);

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
};
