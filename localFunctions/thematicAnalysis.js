const csv = require("fast-csv");
const { db } = require("./admin");

let columns = ["Participant", "numResearchers", "Code", "Category"];
(async () => {
  console.log("thematicAnalysis");
  let counts = {};
  const thematicDocs = await db.collection("thematicAnalysis").get();
  const feedbackCodeBooks = await db.collection("feedbackCodeBooks").get();

  const codeCategories = {};
  for (let doc of feedbackCodeBooks.docs) {
    if (doc.data().hasOwnProperty("category") && doc.data().project === "OnlineCommunities") {
      codeCategories[doc.data().code] = doc.data().category;
    }
  }
  for (let doc of thematicDocs.docs) {
    for (let sentence of Object.keys(doc.data().codesBook)) {
      for (let code of doc.data().codesBook[sentence]) {
        const tId = doc.data().participant;
        if (counts.hasOwnProperty(tId)) {
          counts[tId][code] = counts[tId][code] ? counts[tId][code] + 1 : 1;
        } else {
          counts[tId] = {};
          counts[tId][code] = 1;
        }
      }
    }
  }

  let row;
  let rowData = [[...columns]];
  for (let tId of Object.keys(counts)) {
    for (let code of Object.keys(counts[tId])) {
      if (codeCategories.hasOwnProperty(code)) {
        row = [tId, counts[tId][code], code, codeCategories[code]];
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
    
})();
