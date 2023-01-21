const { Timestamp } = require("firebase-admin/firestore");
const MockData = require("../MockData");
const moment = require("moment");

module.exports = new MockData([
  {
    "documentId": "NkI57lEaHiIbjLBHQ7L",
    "session": Timestamp.fromDate(moment().startOf("hour").toDate()),
    "email": "r3alst@gmail.com",
    "id": "1ktl3t9aer52is8oh1b90nuv54",
    "order": "1st"
  },
  {
    "documentId": "lEajLBHQ7LNkHiIbI57",
    "session": Timestamp.fromDate(moment().add(3, "hour").startOf("hour").toDate()),
    "email": "r3alst@gmail.com",
    "id": "aer52is8oh1ktl3t91b90nuv54",
    "order": "2nd"
  },
  {
    "documentId": "Q7LNlEaHiIbI57jLBHk",
    "session": Timestamp.fromDate(moment().add(10, "hour").startOf("hour").toDate()),
    "email": "r3alst@gmail.com",
    "id": "1ktaer52is8uv54ohl3t91b90n",
    "order": "3rd"
  }
], "schedule")
