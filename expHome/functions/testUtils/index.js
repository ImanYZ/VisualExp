const mockProjectSpecs = require("./mockCollections/projectSpecs.data");
const mockPassages = require("./mockCollections/passages.data");
const mockConditions = require("./mockCollections/conditions.data");
const mockResearchers = require("./mockCollections/researchers.data");
const mockUsers = require("./mockCollections/users.data");
const MockData = require("./MockData")
const deleteAllUsers = require("./deleteAllUsers")

module.exports = {
  MockData,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockResearchers,
  mockUsers,
  deleteAllUsers
}