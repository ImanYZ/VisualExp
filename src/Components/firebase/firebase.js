import fbApp from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

import axios from "axios";

import { firebaseConfig, firebaseOneConfig } from "./config";

// Firestore does not accept more than 500 writes in a transaction or batch write.
const MAX_TRANSACTION_WRITES = 499;

const isFirestoreDeadlineError = (err) => {
  return (
    err.message.includes("DEADLINE_EXCEEDED") ||
    err.message.includes("Received RST_STREAM")
  );
};

class Firebase {
  constructor(fireConfig, instanceName) {
    let app = fbApp;
    if (instanceName) {
      app = app.initializeApp(fireConfig, instanceName);
    } else {
      app.initializeApp(fireConfig);
    }
    this.name = app.name;
    this.auth = app.auth();
    this.currentUser = this.auth.currentUser;
    this.db = app.firestore();
    this.firestore = app.firestore;
    this.storage = app.storage();
    this.storageBucket = firebaseConfig.storageBucket;
    // How many transactions/batchWrites out of 500 so far.
    // I wrote the following functions to easily use batchWrites wthout worrying about the 500 limit.
    this.writeCounts = 0;
    this.batch = this.db.batch();
  }

  // Commit and reset batchWrites and the counter.
  async makeCommitBatch() {
    console.log("makeCommitBatch");
    if (!this.isCommitting) {
      this.isCommitting = true;
      await this.batch.commit();
      this.writeCounts = 0;
      this.batch = this.db.batch();
      this.isCommitting = false;
    } else {
      const batchWaitInterval = setInterval(async () => {
        if (!this.isCommitting) {
          this.isCommitting = true;
          await this.batch.commit();
          this.writeCounts = 0;
          this.batch = this.db.batch();
          this.isCommitting = false;
          clearInterval(batchWaitInterval);
        }
      }, 400);
    }
  }

  // Commit the batchWrite; if you got a Firestore Deadline Error try again every 4 seconds until it gets resolved.
  async commitBatch() {
    try {
      await this.makeCommitBatch();
    } catch (err) {
      console.log({ err });
      if (isFirestoreDeadlineError(err)) {
        const theInterval = setInterval(async () => {
          try {
            await this.makeCommitBatch();
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
  }

  //  If the batchWrite exeeds 499 possible writes, commit and rest the batch object and the counter.
  async checkRestartBatchWriteCounts() {
    this.writeCounts += 1;
    if (this.writeCounts >= MAX_TRANSACTION_WRITES) {
      await this.commitBatch();
    }
  }

  async batchSet(docRef, docData) {
    if (!this.isCommitting) {
      this.batch.set(docRef, docData);
      await this.checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(async () => {
        if (!this.isCommitting) {
          this.batch.set(docRef, docData);
          await this.checkRestartBatchWriteCounts();
          clearInterval(batchWaitInterval);
        }
      }, 400);
    }
  }

  async batchUpdate(docRef, docData) {
    if (!this.isCommitting) {
      this.batch.update(docRef, docData);
      await this.checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(async () => {
        if (!this.isCommitting) {
          this.batch.update(docRef, docData);
          await this.checkRestartBatchWriteCounts();
          clearInterval(batchWaitInterval);
        }
      }, 400);
    }
  }

  async batchDelete(docRef) {
    if (!this.isCommitting) {
      this.batch.delete(docRef);
      await this.checkRestartBatchWriteCounts();
    } else {
      const batchWaitInterval = setInterval(async () => {
        if (!this.isCommitting) {
          this.batch.delete(docRef);
          await this.checkRestartBatchWriteCounts();
          clearInterval(batchWaitInterval);
        }
      }, 400);
    }
  }

  // creating a new id token for current user on firebase auth database
  // add token as authorization for every request to the server
  // validate if user is a valid user
  async idToken() {
    const userToken = await this.auth.currentUser.getIdToken(
      /* forceRefresh */ true
    );
    axios.defaults.headers.common["Authorization"] = userToken;
  }

  // register user with email and password
  async register(email, password, fullname) {
    const newUser = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    await newUser.user.updateProfile({
      displayName: fullname,
    });
    await this.idToken();
    return newUser.user;
  }

  async login(email, password) {
    const newUser = await this.auth.signInWithEmailAndPassword(email, password);
    await this.idToken();
    return newUser.user;
  }

  async logout() {
    await this.auth.signOut();
    delete axios.defaults.headers.common["Authorization"];
  }

  async resetPassword(email) {
    await this.auth.sendPasswordResetEmail(email);
  }
}

axios.defaults.baseURL =
  // "http://localhost:5001/visualexp-a7d2c/us-central1/api/";
  // "https://us-central1-visualexp-a7d2c.cloudfunctions.net/api";
  "https://1cademy.us/api";

export const firebase = new Firebase(firebaseConfig);
export const firebaseOne = new Firebase(firebaseOneConfig, "onecademy");
