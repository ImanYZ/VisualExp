const chai = require("chai");
const http = require("http");
const chaiHttp = require("chai-http");
const app = require("../../app");
const { MockData, deleteAllUsers, mockProjectSpecs, mockPassages, mockConditions } = require("../../testUtils");
const { db } = require("../../admin");
const { expect, describe, beforeAll, afterAll } = require("@jest/globals");
// const { getAuth } = require('firebase-admin/auth');

const server = http.createServer(app);
chai.use(chaiHttp);

describe("POST /api/signUp", () => {
  const collects = [
    new MockData([], "users"),
    new MockData([], "usersSurvey"),
    new MockData([], "userLogs"),
    mockProjectSpecs,
    mockPassages,
    mockConditions
  ];

  const email = "test@test.com";
  const email2 = "test2@test.com";
  const password = "password";

  beforeAll(async () => {
    return Promise.all(collects.map(collect => collect.populate()));
  });

  afterAll(async () => {
    await deleteAllUsers();
    return Promise.all(collects.map(collect => collect.clean()));
  });

  it("should be able to register as participant", async () => {
    const response = await chai.request(server).post("/api/signUp").send({
      email,
      password,
      firstName: "mock",
      lastName: "name",
      institutionName: "University of Michigan - Ann Arbor",
      projectName: "H1L2"
    });
    expect(response.status).toEqual(201);
    const userDoc = await db.collection("users").doc("mock name").get();
    expect(userDoc.exists).toBeTruthy();
  });

  it("should return error if email already exists", async () => {
    const response = await chai.request(server).post("/api/signUp").send({
      email,
      password,
      firstName: "mock",
      lastName: "name",
      institutionName: "University of Michigan - Ann Arbor",
      projectName: "H1L2"
    });
    expect(response.status).toEqual(500);
  });

  it("should be able to register as survey  instructor", async () => {
    const response = await chai.request(server).post("/api/signUp").send({
      email: email2,
      password,
      firstName: "mock",
      lastName: "name",
      instructorId: "lkdjqsdmaplDLSKFdsmml",
      institutionName: "University of Michigan - Ann Arbor",
      projectName: "OnlineCommunities",
      surveyType: "instructor",
      noRetaineData: true
    });
    expect(response.status).toEqual(201);
    const userDoc = await db.collection("usersSurvey").where("email", "==", email2).get();
    expect(userDoc.docs.length).toEqual(1);
  });
});
