const MockData = require("../MockData");
const { Timestamp } = require("firebase-admin/firestore")

module.exports = new MockData([
  {
    "documentId": "Sam Ouhra",
    "projects": {
      "H1L2": {
        "negativeBooleanExpPionts": 0,
        "negativeCodingPoints": 0,
        "dayOneUpVotePoints": 0,
        "active": true,
        "positiveBooleanExpPionts": 0,
        "onePoints": 0,
        "positiveCodingPoints": 0
      }
    },
    "participants": [],
    "email": "ouhrac@gmail.com"
  }  
], "researchers")
