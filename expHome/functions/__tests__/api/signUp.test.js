const chai = require("chai");
const http = require("http");
const chaiHttp = require('chai-http');
const app = require("../../app");
const { MockData, deleteAllUsers, mockProjectSpecs, mockPassages, mockConditions } = require("../../testUtils");
const { db } = require("../../admin_Knowledge");
const {expect, describe, beforeAll, afterAll} = require('@jest/globals');
// const { getAuth } = require('firebase-admin/auth');

const server = http.createServer(app);
chai.use(chaiHttp);

describe("POST /api/signUp", () => {
  const collects = [
    new MockData([], "users"),
    new MockData([], "usersStudentCoNoteSurvey"),
    new MockData([], "usersInstructorCoNoteSurvey"),
    new MockData([], "userLogs"),
    mockProjectSpecs,
    mockPassages,
    mockConditions
  ];

  const email = "test@test.com";
  const email2 = "test2@test.com";
  const email3 = "test3@test.com";
  const password = "password";


  beforeAll(async () => {
    return Promise.all(collects.map(collect => collect.populate()));
  })

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
    expect(response.status).toEqual(201)
    const userDoc = await db.collection("users").doc("mock name").get()
    expect(userDoc.exists).toBeTruthy();
  })

  it("should be able to register as survey student", async () => {
    const response = await chai.request(server).post("/api/signUp").send({
      email: email2,
      password,
      firstName: "mock",
      lastName: "name",
      institutionName: "University of Michigan - Ann Arbor",
      projectName: "H1L2",
      surveyType: "student"
    });
    expect(response.status).toEqual(201)
    const userDoc = await db.collection("usersStudentCoNoteSurvey").doc("mock name ").get()
    expect(userDoc.exists).toBeTruthy();
  })

  it("should be able to register as survey instructor", async () => {
    const response = await chai.request(server).post("/api/signUp").send({
      email: email3,
      password,
      firstName: "mock",
      lastName: "name",
      institutionName: "University of Michigan - Ann Arbor",
      projectName: "H1L2",
      surveyType: "instructor"
    });
    expect(response.status).toEqual(201)
    const userDoc = await db.collection("usersInstructorCoNoteSurvey").doc("mock name  ").get()
    expect(userDoc.exists).toBeTruthy();
  })
})