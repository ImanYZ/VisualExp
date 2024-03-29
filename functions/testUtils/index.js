const mockApplications = require("./mockCollections/applications.data");
const mockProjectSpecs = require("./mockCollections/projectSpecs.data");
const mockPassages = require("./mockCollections/passages.data");
const mockConditions = require("./mockCollections/conditions.data");
const mockResearchers = require("./mockCollections/researchers.data");
const mockUsers = require("./mockCollections/users.data");
const mockResSchedule = require("./mockCollections/resSchedule.data");
const mockRecallGradesV2 = require("./mockCollections/recallGradesV2.data");
const mockBooleanScratch = require("./mockCollections/booleanScratch.data");
const mockSchedules = require("./mockCollections/schedule.data");
const mockFeedbackCodes = require("./mockCollections/feedbackCode.data");
const MockData = require("./MockData")
const deleteAllUsers = require("./deleteAllUsers")
const writeTransaction = require("./writeTransaction")

module.exports = {
  MockData,
  mockApplications,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockResearchers,
  mockUsers,
  mockResSchedule,
  mockRecallGradesV2,
  mockBooleanScratch,
  mockSchedules,
  mockFeedbackCodes,
  deleteAllUsers,
  writeTransaction
}