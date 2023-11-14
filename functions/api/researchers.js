const express = require("express");
const gradeRecalls = require("../actions/researchers/gradeRecalls");
const codeFeedback = require("../actions/researchers/codeFeedback");
const voteActivities = require("../actions/researchers/voteActivities");
const schedule = require("../actions/researchers/schedule");
const voteActivityReset = require("../actions/researchers/voteActivityReset");

const deleteActivity = require("../actions/researchers/deleteActivity");

const voteInstructor = require("../actions/researchers/voteInstructor");

const voteInstructorReset = require("../actions/researchers/voteInstructorReset");

const voteAdministrator = require("../actions/researchers/voteAdministrator");

const voteAdministratorReset = require("../actions/researchers/voteAdministratorReset");

const retreiveFeedbackcodes = require("../actions/researchers/retreiveFeedbackcodes");

const loadResponses = require("../actions/researchers/loadResponses");

const voteOnSingleRecall = require("../actions/researchers/voteOnSingleRecall");
const loadRecallGrades = require("../actions/researchers/loadRecallGrades");

const updateThematicCode = require("../actions/researchers/updateThematicCode");
const deleteThematicCode = require("../actions/researchers/deleteThematicCode");

const loadRecallGradesNumbers = require("../actions/researchers/loadRecallGradesNumbers");
const gradeGPT = require("../actions/researchers/gradeGPT");

const submitThematic = require("../actions/researchers/submitThematic");

const updatePhraseForPassage = require("../actions/researchers/updatePhraseForPassage");
const addNewPhraseForPassage = require("../actions/researchers/addNewPhraseForPassage");
const calcultesRecallGradesRecords = require("../actions/researchers/calcultesRecallGradesRecords");
const deletePhraseFromPassage = require("../actions/researchers/deletePhraseFromPassage");

const uploadAndReadFiles = require("../actions/researchers/uploadAndReadFiles");

const firebaseAuth = require("../middlewares/firebaseAuth");
const isResearcher = require("../middlewares/isResearcher");
const researchersRouter = express.Router();

researchersRouter.use(firebaseAuth);
researchersRouter.use(isResearcher);

// POST /api/researchers/schedule
researchersRouter.post("/schedule", schedule);

// POST /api/researchers/gradeRecalls
researchersRouter.post("/gradeRecalls", gradeRecalls);

// POST /api/researchers/codeFeedback
researchersRouter.post("/codeFeedback", codeFeedback);

// POST /api/researchers/voteActivities
researchersRouter.post("/voteActivities", voteActivities);

// POST /api/researchers/voteActivityReset
researchersRouter.post("/voteActivityReset", voteActivityReset);

// POST /api/researchers/deleteActivity
researchersRouter.post("/deleteActivity", deleteActivity);

// POST /api/researchers/voteInstructor
researchersRouter.post("/voteInstructor", voteInstructor);

// POST /api/researchers/voteInstructorReset
researchersRouter.post("/voteInstructorReset", voteInstructorReset);

// POST /api/researchers/voteAdministrator
researchersRouter.post("/voteAdministrator", voteAdministrator);

// POST /api/researchers/voteAdministratorReset
researchersRouter.post("/voteAdministratorReset", voteAdministratorReset);

// POST /api/researchers/retreiveFeedbackcodes
researchersRouter.post("/retreiveFeedbackcodes", retreiveFeedbackcodes);

// POST /api/researchers/loadResponses
researchersRouter.post("/loadResponses", loadResponses);

// POST /api/researchers/voteOnSingleRecall
researchersRouter.post("/voteOnSingleRecall", voteOnSingleRecall);

// POST /api/researchers/loadRecallGrades
researchersRouter.post("/loadRecallGrades", loadRecallGrades);

// POST /api/researchers/updateThematicCode
researchersRouter.post("/updateThematicCode", updateThematicCode);

// POST /api/researchers/deleteThematicCode
researchersRouter.post("/deleteThematicCode", deleteThematicCode);

// POST /api/researchers/loadRecallGradesNumbers
researchersRouter.get("/loadRecallGradesNumbers", loadRecallGradesNumbers);

// POST /api/researchers/submitThematic
researchersRouter.post("/submitThematic", submitThematic);

// POST /api/researchers/updatePhraseForPassage
researchersRouter.post("/updatePhraseForPassage", updatePhraseForPassage);

// POST /api/researchers/addNewPhraseForPassage
researchersRouter.post("/addNewPhraseForPassage", addNewPhraseForPassage);

// POST /api/researchers/calcultesRecallGradesRecords
researchersRouter.post("/calcultesRecallGradesRecords", calcultesRecallGradesRecords);

// POST /api/researchers/deletePhraseFromPassage
researchersRouter.post("/deletePhraseFromPassage", deletePhraseFromPassage);

// POST /api/researchers/uploadAndReadFiles
researchersRouter.post("/uploadAndReadFiles", uploadAndReadFiles);

// POST /api/researchers/gradeGPT
researchersRouter.post("/gradeGPT", gradeGPT);

// POST /api/researchers/loadResponses
researchersRouter.post("/loadResponses", loadResponses);

module.exports = researchersRouter;
