const chai = require("chai");
const http = require("http");
const moment = require("moment");
const chaiHttp = require('chai-http');
const app = require("../../app");
const { MockData, deleteAllUsers, mockProjectSpecs, mockPassages, mockConditions, mockUsers } = require("../../testUtils");
const { auth: frontAuth } = require("../../testUtils/firestore");
const { db, admin } = require("../../admin");
const {expect, describe, beforeAll, afterAll} = require('@jest/globals');
const { getAuth } = require('firebase-admin/auth');
const { signInWithEmailAndPassword } = require("firebase/auth");

const server = http.createServer(app);
chai.use(chaiHttp);

describe("POST /api/researchers/schedule", () => {
  const collects = [
    mockUsers,
    new MockData([], "userLogs"),
    new MockData([], "resSchedule"),
    mockProjectSpecs,
    mockPassages,
    mockConditions
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

  let scheduleIds = [];
  const schedules = [
    moment().utcOffset(-4).startOf("day").format("YYYY-MM-DD hh:mm"),
    moment().utcOffset(-4).startOf("day").add(1, "day").format("YYYY-MM-DD hh:mm"),
    moment().utcOffset(-4).startOf("day").add(4, "days").format("YYYY-MM-DD hh:mm"),
    moment().utcOffset(-4).startOf("day").add(8, "days").format("YYYY-MM-DD hh:mm")
  ]

  it("should be able to update researcher's schedule", async () => {
    const response = await chai.request(server).post("/api/researchers/schedule")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send({
      fullname,
      project,
      schedule: schedules
    });
    expect(response.status).toEqual(200)
    scheduleIds = response.body.scheduleIds || [];
  })

  let resScheduleData = {};

  it("researcher should exist in created/updated document", async () => {
    const resSchedule = await db.collection("resSchedule").doc(scheduleIds[0]).get()
    resScheduleData = resSchedule.data();

    expect(resScheduleData.researchers.includes(fullname)).toBeTruthy()
  })

  it("schedule slot should be present in created/updated document", async () => {
    expect(resScheduleData.schedules[fullname].includes(schedules[0])).toBeTruthy()
  })

  it("schedule slot should be present in created/updated document", async () => {
    expect(resScheduleData.project).toEqual(project)
  })
})