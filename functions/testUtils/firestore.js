const { initializeApp } = require("firebase/app");
const { connectAuthEmulator, getAuth } = require("firebase/auth");
const { connectFirestoreEmulator, getFirestore } = require("firebase/firestore");

const app = initializeApp({
  projectId: "test",
  appId: "test",
  apiKey: "test",
});
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8080);
const auth = getAuth(app);
connectAuthEmulator(auth, "http://localhost:9099");

module.exports = {
  app,
  db,
  auth
}