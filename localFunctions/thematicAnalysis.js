const csv = require("fast-csv");
const { db } = require("./admin");

const participantCodes = {
  "Ava Lindo": "S4",
  "Doug Paxton": "I4",
  "Merve Hickok": "I5",
  "Anika Vandermast": "S3",
  "Diego Rojas": "I6",
  "Goldey Katherine": "I7",
  "Baoheng Ke": "S5",
  "Michael Treadway": "I8",
  "Steve Oney": "I2",
  "Oleg Nikolsky": "I9",
  "Alisar Alabdullah": "S6",
  "Dave Westenberg": "I10",
  "Belgin Kazkaz": "S7",
  "J Edward Colgate": "I11",
  "Reiter-Salisbury Nancy": "I12",
  "Tebo Kristen": "I13",
  "Anselm Spoerri": "I14",
  "Eytan Adar": "I15",
  "Nabeel Mohamed": "S8",
  "Ryan Paitz": "I16",
  "Michael Cherney": "I17",
  "Denali Wood": "S9",
  "Júlia Romagnoli": "S10",
  "Edward Cannon": "I18",
  "Maymani Adhiphandhuamphai": "S2",
  "Emily Brabec": "S11",
  "Jennifer McGee": "I1",
  "George Hoffman": "I3",
  "Salma Hassab": "S1"
};

let columns = ["Participant", "numResearchers", "Code", "Category", "Role"];
let columns2 = ["Code", "participantsNum", "Category", "Role"];
(async () => {
  console.log("thematicAnalysis");
  let counts = {};
  let codesCountes = {};
  const thematicDocs = await db.collection("thematicAnalysis").get();
  const feedbackCodeBooks = await db.collection("feedbackCodeBooks").get();
  const transcriptDocs = await db.collection("transcript").get();

  const transcrips = {};
  for (let doc of transcriptDocs.docs) {
    transcrips[doc.data().participant] = doc.data().surveyType;
  }
  const codeCategories = {};
  for (let doc of feedbackCodeBooks.docs) {
    if (doc.data().hasOwnProperty("category") && doc.data().project === "OnlineCommunities") {
      codeCategories[doc.data().code] = doc.data().category;
    }
  }
  const participants = [];
  for (let doc of thematicDocs.docs) {
    const tId = doc.data().participant;
    if (!participants.includes(tId)) {
      participants.push(tId);
    }

    for (let sentence of Object.keys(doc.data().codesBook)) {
      for (let code of doc.data().codesBook[sentence]) {
        if (counts.hasOwnProperty(tId) && counts[tId].hasOwnProperty(code)) {
          if (!counts[tId][code].includes(doc.data().researcher)) counts[tId][code].push(doc.data().researcher);
        } else {
          if (counts.hasOwnProperty(tId)) {
            counts[tId] = {
              ...counts[tId],
              [code]: [doc.data().researcher]
            };
          } else {
            counts[tId] = {
              [code]: [doc.data().researcher]
            };
          }
        }
      }
    }
  }

  console.log(participants);
  let row;
  let rowData = [[...columns]];
  let rowData2 = [[...columns2]];
  for (let tId of Object.keys(counts)) {
    for (let code of Object.keys(counts[tId])) {
      if (codeCategories.hasOwnProperty(code)) {
        if (counts[tId][code].length >= 2) {
          if (codesCountes.hasOwnProperty(code)) {
            codesCountes[code] = codesCountes[code] + 1;
          } else {
            codesCountes[code] = 1;
          }
        }
      }
    }
  }
  const codeRole = {};
  const codeParticipants = {};
  for (let tId of Object.keys(counts)) {
    for (let code of Object.keys(counts[tId])) {
      if (codeCategories.hasOwnProperty(code)) {
        if (codeRole[code] !== "instructor") {
          codeRole[code] = transcrips[tId];
        }
        row = [tId, counts[tId][code].length, code, codeCategories[code], transcrips[tId]];
        rowData.push(row);
        if (!codeParticipants.hasOwnProperty(code)) {
          codeParticipants[code] = new Set();
        }
        if (!participantCodes.hasOwnProperty(tId)) {
          participantCodes[tId] = "S10";
        }
        codeParticipants[code].add(participantCodes[tId]);
      }
    }
  }
  for (let code of Object.keys(codesCountes)) {
    row = [code, codesCountes[code], codeCategories[code], codeRole[code]];
    rowData2.push(row);
  }
  for (let code of Object.keys(codeParticipants)) {
    console.log("\\item \\textit{" + code + " - " + [...codeParticipants[code]] + "}");
  }

  csv
    .writeToPath("csv/thematicAnalysis.csv", [...rowData], {
      headers: true
    })
    .on("finish", () => {
      console.log("Done!");
    });
  csv
    .writeToPath("csv/thematicAnalysisCodes.csv", [...rowData2], {
      headers: true
    })
    .on("finish", () => {
      console.log("Done!");
    });
})();
