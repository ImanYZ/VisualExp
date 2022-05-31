"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchDelete =
  exports.batchUpdate =
  exports.batchSet =
  exports.isFirestoreDeadlineError =
  exports.commitBatch =
  exports.checkRestartBatchWriteCounts =
  exports.MAX_TRANSACTION_WRITES =
  exports.db =
  exports.firebaseApp =
  exports.admin =
    void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// For production:
// admin.initializeApp();
require("dotenv").config();
const firebaseApp = global.firebaseApp
  ? global.firebaseApp
  : (0, app_1.initializeApp)(
      {
        credential: (0, app_1.cert)({
          type: "service_account",
          project_id: process.env.ONECADEMYCRED_PROJECT_ID,
          private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
          private_key:
            (_a = process.env.ONECADEMYCRED_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
          client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
          client_id: process.env.ONECADEMYCRED_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
          storageBucket: "onecademy-dev.appspot.com",
          databaseURL: "https://onecademy-dev-default-rtdb.firebaseio.com/"
        })
      },
      "onecademy"
    );
exports.firebaseApp = firebaseApp;
// store on global object so we can reuse it if we attempt
// to initialize the app again
global.firebaseApp = firebaseApp;
// Firestore does not accept more than 500 writes in a transaction or batch write.
const MAX_TRANSACTION_WRITES = 499;
exports.MAX_TRANSACTION_WRITES = MAX_TRANSACTION_WRITES;
const isFirestoreDeadlineError = err => {
  console.log({ err });
  const errString = err.toString();
  return (
    errString.includes("Error: 13 INTERNAL: Received RST_STREAM") ||
    errString.includes("Error: 4 DEADLINE_EXCEEDED: Deadline exceeded")
  );
};
exports.isFirestoreDeadlineError = isFirestoreDeadlineError;
const db = (0, firestore_1.getFirestore)(firebaseApp);
exports.db = db;
// How many transactions/batchWrites out of 500 so far.
// I wrote the following functions to easily use batchWrites wthout worrying about the 500 limit.
let writeCounts = 0;
let batch = db.batch();
let isCommitting = false;
// Commit and reset batchWrites and the counter.
const makeCommitBatch = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log("makeCommitBatch");
    if (!isCommitting) {
      isCommitting = true;
      yield batch.commit();
      writeCounts = 0;
      batch = db.batch();
      isCommitting = false;
    } else {
      const batchWaitInterval = setInterval(
        () =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (!isCommitting) {
              isCommitting = true;
              yield batch.commit();
              writeCounts = 0;
              batch = db.batch();
              isCommitting = false;
              clearInterval(batchWaitInterval);
            }
          }),
        400
      );
    }
  });
// Commit the batchWrite; if you got a Firestore Deadline Error try again every 4 seconds until it gets resolved.
const commitBatch = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      yield makeCommitBatch();
    } catch (err) {
      console.log({ err });
      if (isFirestoreDeadlineError(err)) {
        const theInterval = setInterval(
          () =>
            __awaiter(void 0, void 0, void 0, function* () {
              try {
                yield makeCommitBatch();
                clearInterval(theInterval);
              } catch (err) {
                console.log({ err });
                if (!isFirestoreDeadlineError(err)) {
                  clearInterval(theInterval);
                  throw err;
                }
              }
            }),
          4000
        );
      }
    }
  });
exports.commitBatch = commitBatch;
//  If the batchWrite exeeds 499 possible writes, commit and rest the batch object and the counter.
const checkRestartBatchWriteCounts = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    writeCounts += 1;
    if (writeCounts >= MAX_TRANSACTION_WRITES) {
      yield commitBatch();
    }
  });
exports.checkRestartBatchWriteCounts = checkRestartBatchWriteCounts;
const batchSet = (docRef, docData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!isCommitting) {
      batch.set(docRef, docData);
      yield checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(
        () =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (!isCommitting) {
              batch.set(docRef, docData);
              yield checkRestartBatchWriteCounts();
              clearInterval(batchWaitInterval);
            }
          }),
        400
      );
    }
  });
exports.batchSet = batchSet;
const batchUpdate = (docRef, docData) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!isCommitting) {
      batch.update(docRef, docData);
      yield checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(
        () =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (!isCommitting) {
              batch.update(docRef, docData);
              yield checkRestartBatchWriteCounts();
              clearInterval(batchWaitInterval);
            }
          }),
        400
      );
    }
  });
exports.batchUpdate = batchUpdate;
const batchDelete = docRef =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!isCommitting) {
      batch.delete(docRef);
      yield checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(
        () =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (!isCommitting) {
              batch.delete(docRef);
              yield checkRestartBatchWriteCounts();
              clearInterval(batchWaitInterval);
            }
          }),
        400
      );
    }
  });
exports.batchDelete = batchDelete;
