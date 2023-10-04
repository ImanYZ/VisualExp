const admin = require("firebase-admin");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../", ".env")
});

const app = admin.initializeApp(
  {
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://visualexp-a7d2c-default-rtdb.firebaseio.com/"
  },
  "visualexp"
);
const dbReal = app.database();

module.exports = {
  dbReal
};
