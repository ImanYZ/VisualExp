import fbApp from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

import axios from "axios";

import { firebaseConfig, firebaseOneConfig } from "./config";

const MAX_TRANSACTION_WRITES = 499;

const isFirestoreDeadlineError = (err) => {
  return err.message.includes("DEADLINE_EXCEEDED");
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
    this.batch = this.db.batch();
    this.writeCounts = 0;
  }

  async makeCommitBatch(batch) {
    console.log("makeCommitBatch");
    await this.batch.commit();
    this.batch = this.db.batch();
    this.writeCounts = 0;
  }

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

  async checkRestartBatchWriteCounts() {
    this.writeCounts += 1;
    if (this.writeCounts >= MAX_TRANSACTION_WRITES) {
      await this.commitBatch();
    }
  }

  async batchSet(docRef, docData) {
    this.batch.set(docRef, docData);
    await this.checkRestartBatchWriteCounts();
  }

  async batchUpdate(docRef, docData) {
    this.batch.update(docRef, docData);
    await this.checkRestartBatchWriteCounts();
  }

  async batchDelete(docRef) {
    this.batch.delete(docRef);
    await this.checkRestartBatchWriteCounts();
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
  "https://us-central1-visualexp-a7d2c.cloudfunctions.net/api";
// "https://1cademy.us/api";

export const firebase = new Firebase(firebaseConfig);
export const firebaseOne = new Firebase(firebaseOneConfig, "onecademy");
