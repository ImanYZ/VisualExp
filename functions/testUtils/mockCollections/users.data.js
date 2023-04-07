const MockData = require("../MockData");
const { Timestamp } = require("firebase-admin/firestore")

module.exports = new MockData([
  {
    "documentId": "Sam Ouhra",
    "leading": [],
    "phase": 0,
    "step": 1,
    "lastLoad": Timestamp.fromDate(new Date()),
    "lastname": "Ouhra",
    "currentPCon": {
      "condition": "H2",
      "passage": "xuNQUYbAEFfTD1PHuLGV"
    },
    "nullPassage": "97D6P4unPYqzkpVeUY2c",
    "uid": "sam",
    "Transcript": "https://firebasestorage.googleapis.com/v0/b/visualexp-5d2c6.appspot.com/o/Transcripts%2FSam%20Ouhra%2FTue%2C%2020%20Dec%202022%2014%3A35%3A45%20GMT.pdf?alt=media&token=566531b5-8385-4621-9535-dab6651fb572",
    "email": "ouhrac@gmail.com",
    "institution": "",
    "firstname": "Sam",
    "Resume": "https://firebasestorage.googleapis.com/v0/b/visualexp-5d2c6.appspot.com/o/Resumes%2FSam%20Ouhra%2FThu%2C%2001%20Dec%202022%2016%3A36%3A19%20GMT.pdf?alt=media&token=60a584d6-2a5d-4c92-b1d3-bbf863253f91",
    "project": "H1L2",
    "tutorialEnded": true,
    "choices": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    "updatedAt": Timestamp.fromDate(new Date()),
    "pConditions": [
      {
        "passage": "s1oo3G4n3jeE8fJQRs3g",
        "pretestScore": 0,
        "pretest": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        ],
        "pretestScoreRatio": 0,
        "condition": "H2"
      },
      {
        "condition": "K2",
        "passage": "lmGQvzSit4LBTj1Zptot"
      }
    ],
    "createdAt": Timestamp.fromDate(new Date())
  },
  {
    "documentId": "Ameer Hamza",
    "leading": [],
    "phase": 0,
    "step": 1,
    "lastLoad": Timestamp.fromDate(new Date()),
    "lastname": "Hamza",
    "currentPCon": {
      "condition": "H1",
      "passage": "6rc4k1su3txN6ZK4CJ0h"
    },
    "nullPassage": "6rc4k1su3txN6ZK4CJ0h",
    "uid": "ameer",
    "Transcript": "https://firebasestorage.googleapis.com/v0/b/visualexp-5d2c6.appspot.com/o/Transcripts%2FSam%20Ouhra%2FTue%2C%2020%20Dec%202022%2014%3A35%3A45%20GMT.pdf?alt=media&token=566531b5-8385-4621-9535-dab6651fb572",
    "email": "r3alst@gmail.com",
    "institution": "",
    "firstname": "Ameer",
    "Resume": "https://firebasestorage.googleapis.com/v0/b/visualexp-5d2c6.appspot.com/o/Resumes%2FSam%20Ouhra%2FThu%2C%2001%20Dec%202022%2016%3A36%3A19%20GMT.pdf?alt=media&token=60a584d6-2a5d-4c92-b1d3-bbf863253f91",
    "project": "H1L2",
    "tutorialEnded": true,
    "applicationsSubmitted": {
      "Clinical_Psychology": true
    },
    "choices": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    "updatedAt": Timestamp.fromDate(new Date()),
    "pConditions": [
      {
        "passage": "6rc4k1su3txN6ZK4CJ0h",
        "pretestScore": 0,
        "pretest": [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          ""
        ],
        "pretestScoreRatio": 0,
        "condition": "H1"
      },
      {
        "condition": "L2",
        "passage": "UowdqbVHYMJ9Hhh5zNY3"
      }
    ],
    "createdAt": Timestamp.fromDate(new Date())
  }
], "users")
