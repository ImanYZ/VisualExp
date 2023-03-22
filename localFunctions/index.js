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
  moveResearchersPoints,
  deleteDuplicatesWithNoVotes,
  deleteDuplicatesWithVotes,
  addDoneFeildToRecallGrades,
  deleteIncompleteRecallGrades,
  restructureFeedBackCode,
  deleteDamagedDocumentsOnFreeRecallGrades,
  correctTheDataStructureForDamagedUsers,
  deleteDamageDocumentForAffectedUsersInRecallGrades,
  makeCorrectionToPhrasesinRecallGrades,
  createRecallGradesForNewUserH1L2,
  deleteTheKeyPhrasesForPassage,
  recreateNewRecallGradesDocuments,
  addNexDataToFeedbackCode,
  fixActivityProject,
  appendPointsFieldForEmptyRecalls,
  addTheInstitutionFeildForUsers,
  addH2K2toQuotes,
  generatedBooleanExpressionData,
  convertRsearchersProject,
  generateTheCSVfileChatGTP,
  generateCSVChatGTPNotSatisfied,
  gradeRecallGradesV2ChatGPT,
  removeTheBotsVotes,
} = require("./visualExp");

const app = express();

app.get("/fixActivityProject", fixActivityProject);
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
app.get("/moveResearchersPoints", moveResearchersPoints);
app.get("/deleteDuplicatesWithNoVotes", deleteDuplicatesWithNoVotes);
app.get("/deleteDuplicatesWithVotes", deleteDuplicatesWithVotes);
app.get("/addDoneFeildToRecallGrades", addDoneFeildToRecallGrades);
app.get("/deleteIncompleteRecallGrades", deleteIncompleteRecallGrades);
app.get("/restructureFeedBackCode", restructureFeedBackCode);
app.get(
  "/deleteDamagedDocumentsOnFreeRecallGrades",
  deleteDamagedDocumentsOnFreeRecallGrades
);
app.get(
  "/correctTheDataStructureForDamagedUsers",
  correctTheDataStructureForDamagedUsers
);
app.get(
  "/deleteDamageDocumentForAffectedUsersInRecallGrades",
  deleteDamageDocumentForAffectedUsersInRecallGrades
);
app.get(
  "/makeCorrectionToPhrasesinRecallGrades",
  makeCorrectionToPhrasesinRecallGrades
);

app.get("/createRecallGradesForNewUserH1L2", createRecallGradesForNewUserH1L2);

app.get("/deleteTheKeyPhrasesForPassage", deleteTheKeyPhrasesForPassage);
app.get("/recreateNewRecallGradesDocuments", recreateNewRecallGradesDocuments);
app.get("/addNexDataToFeedbackCode", addNexDataToFeedbackCode);
app.get("/appendPointsFieldForEmptyRecalls", appendPointsFieldForEmptyRecalls);
app.get("/addTheInstitutionFeildForUsers", addTheInstitutionFeildForUsers);
app.get("/addH2K2toQuotes", addH2K2toQuotes);
app.get("/generatedBooleanExpressionData", generatedBooleanExpressionData);

app.get("/convertRsearchersProject", convertRsearchersProject);

app.get("/generateTheCSVfileChatGTP", generateTheCSVfileChatGTP);
app.get("/generateCSVChatGTPNotSatisfied", generateCSVChatGTPNotSatisfied);
app.get("/gradeRecallGradesV2ChatGPT", gradeRecallGradesV2ChatGPT);

app.get("/removeTheBotsVotes", removeTheBotsVotes);

const port = 8080;
app.listen(port, () => {
  console.log("1Cademy local Express server for one-time functions!", port);
});
