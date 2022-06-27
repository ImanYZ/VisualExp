const express = require("express");

const {
  downloadNodes,
  fixInstitutionInUsers,
  identifyDuplicateInstitutionDomains,
} = require("./knowledge");

const {
  addRecallGradesColl,
  restructureProjectSpecs,
  checkRepeatedRecallGrades,
} = require("./visualExp");

const app = express();

app.get("/", (req, res) => {
  console.log("Hello world received a request.");
  res.send(`Hello World!\n`);
});
app.get("/addRecallGradesColl", addRecallGradesColl);
app.get("/checkRepeatedRecallGrades", checkRepeatedRecallGrades);
app.get("/downloadNodes", downloadNodes);
app.get("/fixInstitutionInUsers", fixInstitutionInUsers);
app.get(
  "/identifyDuplicateInstitutionDomains",
  identifyDuplicateInstitutionDomains
);
app.get("/restructureProjectSpecs", restructureProjectSpecs);

const port = 8080;
app.listen(port, () => {
  console.log("1Cademy local Express server for one-time functions!", port);
});
