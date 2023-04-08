const { Timestamp } = require("firebase-admin/firestore");
const MockData = require("../MockData");
const moment = require("moment");

module.exports = new MockData([
  {
    "documentId": "015NQqiTrlVR7dUCdBY9",
    "coderChoiceConditions": {
      "Researcher Name": {
        "sentence1": {
          "code1": "H1/L2",
          "code2": "H1/L2"
        }
      }
    },
    "updatedAt": Timestamp.fromDate(new Date()),
    "coders": [],
    "expIdx": 1,
    "choice": "Neither",
    "codesVotes": {},
    "project": "H1L2",
    "codersChoiceConditions": {
      "Sam Ouhra": {
        "It was easier to navigate/maneuver through.": "L2",
        "The information was presented in chunks.": "H1",
        "The information was presented more concisely.": "L2",
        "add new code": "H1",
        "It took me less time to read the passage test": "H1",
        "The key information was easier to identify.": "H1",
        "It was easier to find the answers to the multiple-choice questions.": "L2",
        "It was easier to quickly skim through the passage.": "H1",
        "new Code": "L2",
        "The information was presented in multiple pages.": "H1",
        "upAll the information was in a single page.": "H1",
        "The information was easier to follow.": "H1",
        "Reading it felt more natural.": "L2"
      }
    },
    "explanation": "I would prefer to read a straight forward article. There is no need to have information presented in odd formats, it is distracting from the actual content. ",
    "createdAt": Timestamp.fromDate(new Date()),
    "approved": true,
    "codersChoices": {
      "Sam Ouhra": {
        "The key information was easier to identify.": [
          "I would prefer to read a straight forward article",
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "The information was easier to follow.": [
          " There is no need to have information presented in odd formats, it is distracting from the actual content",
          "I would prefer to read a straight forward article"
        ],
        "[object Object]": [],
        "new Code": [
          "I would prefer to read a straight forward article",
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "add new code": [
          "I would prefer to read a straight forward article",
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "It was easier to find the answers to the multiple-choice questions.": [
          "I would prefer to read a straight forward article",
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "Reading it felt more natural.": [
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "upAll the information was in a single page.": [
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "It was easier to quickly skim through the passage.": [],
        "It was easier to navigate/maneuver through.": [],
        "The information was presented in multiple pages.": [],
        "The information was presented more concisely.": [
          " There is no need to have information presented in odd formats, it is distracting from the actual content",
          "I would prefer to read a straight forward article"
        ],
        "It took me less time to read the passage test": [
          "I would prefer to read a straight forward article",
          " There is no need to have information presented in odd formats, it is distracting from the actual content"
        ],
        "The information was presented in chunks.": []
      }
    },
    "fullname": "Ameer Hamza",
    "session": "1st"
  }
], "feedbackCode");