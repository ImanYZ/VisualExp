const chai = require("chai");
const http = require("http");
const moment = require("moment");
const chaiHttp = require('chai-http');
const { MockData, deleteAllUsers, mockProjectSpecs, mockPassages, mockConditions, mockUsers, mockResearchers } = require("../../../testUtils");
const { auth: frontAuth } = require("../../../testUtils/firestore");
const { db, admin } = require("../../../admin");
const {expect, describe, beforeAll, afterAll} = require('@jest/globals');
const { getAuth } = require('firebase-admin/auth');
const { signInWithEmailAndPassword } = require("firebase/auth");
const app = require("../../../app");

const server = http.createServer(app);
chai.use(chaiHttp);

describe("POST /api/researchers/gradeRecalls", () => {
  const collects = [
    mockUsers,
    new MockData([], "userLogs"),
    new MockData([], "resSchedule"),
    mockProjectSpecs,
    mockPassages,
    mockConditions,
    mockResearchers
  ];

  const fullname = "Sam Ouhra";
  const email = "ouhrac@gmail.com";
  const password = "sam2022";
  const project = "H1L2";
  let accessToken = "";

  beforeAll(async () => {
    const auth = getAuth(admin);
    await auth.createUser({
      displayName: fullname,
      email,
      emailVerified: true,
      password
    })
    
    const r = await signInWithEmailAndPassword(frontAuth, email, password);
    accessToken = await r.user.getIdToken(false);

    return Promise.all(collects.map(collect => collect.populate()));
  })

  afterAll(async () => {
    await deleteAllUsers();
    return Promise.all(collects.map(collect => collect.clean()));
  });

  it("should be able to grade recalls as researcher", async () => {
    console.log("grade recalls");
    /* const response = await chai.request(server).post("/api/researchers/schedule")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send({
      project,
      schedule: schedules
    });
    expect(response.status).toEqual(200)
    scheduleIds = response.body.scheduleIds || []; */
  })
})