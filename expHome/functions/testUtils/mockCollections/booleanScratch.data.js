const { Timestamp } = require("firebase-admin/firestore");
const MockData = require("../MockData");

module.exports = new MockData([
  {
    "documentId": "3BA5Fy6JztMHazIyC9HT",
    "downVotes": 0,
    "email": "ouhrac@gmail.com",
    "upVotes": 1,
    "createdAt": Timestamp.fromDate(new Date()),
    "phrase": "Barn owl's life depends on hearing",
    "downVoters": [],
    "schema": [
      {
        "keyword": "hearing",
        "alternatives": [
          "life",
          "rely",
          "reli",
          "need",
          "requir",
          "liv"
        ],
        "id": "r-76faf087-7184-4831-a7a8-0842ba48cc7e",
        "not": false
      }
    ],
    "fullname": "Sam Ouhra",
    "passage": "The Hearing of the Barn Owl",
    "upVoters": []
  }  
], "booleanScratch")