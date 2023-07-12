const csv = require("fast-csv");
const { db } = require("./admin");

let columns = ["Participant", "numResearchers", "Code", "Category"];
let columns2 = ["Code", "participantsNum", "Category"];
(async () => {
  console.log("thematicAnalysis");
  let counts = {};
  let codesCountes = {};
  const thematicDocs = await db.collection("thematicAnalysis").get();
  const feedbackCodeBooks = await db.collection("feedbackCodeBooks").get();

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

  for (let code of Object.keys(codesCountes)) {
    row = [code, codesCountes[code], codeCategories[code]];
    rowData2.push(row);
  }

  for (let tId of Object.keys(counts)) {
    for (let code of Object.keys(counts[tId])) {
      if (codeCategories.hasOwnProperty(code)) {
        row = [tId, counts[tId][code].length, code, codeCategories[code]];
        rowData.push(row);
      }
    }
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
