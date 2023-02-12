const chai = require("chai");
const http = require("http");
const moment = require("moment");
const chaiHttp = require("chai-http");
const app = require("../../app");
const {
  MockData,
  deleteAllUsers,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockUsers,
  mockResearchers,
  mockResSchedule
} = require("../../testUtils");
const { auth: frontAuth } = require("../../testUtils/firestore");
const { db, admin } = require("../../admin");
const { expect, describe, beforeAll, afterAll } = require("@jest/globals");
const { getAuth } = require("firebase-admin/auth");
const { signInWithEmailAndPassword } = require("firebase/auth");
const { gtDeleteAllEvents } = require("../../testUtils/gtCalendar");

const server = http.createServer(app);
chai.use(chaiHttp);

describe("POST /api/participants/schedule", () => {
  const collects = [
    mockUsers,
    new MockData([], "userLogs"),
    new MockData([], "resSchedule"),
    new MockData([], "schedule"),
    mockProjectSpecs,
    mockPassages,
    mockConditions,
    mockResSchedule,
    mockResearchers
  ];

  const fullname = "Sam Ouhra";
  const email = "ouhrac@gmail.com";
  const password = "sam2022";
  const project = "H1L2";
  let accessToken = "";
  let accessToken2 = "";
  const participant = {
    fullname: "Ameer Hamza",
    email: "r3alst@gmail.com",
    password: "password",
    project: "H1L2"
  };

  beforeAll(async () => {
    const auth = getAuth(admin);
    await auth.createUser({
      displayName: fullname,
      email,
      emailVerified: true,
      password,
      uid: mockUsers.data[0].uid
    });

    await auth.createUser({
      displayName: participant.fullname,
      email: participant.email,
      emailVerified: true,
      password: participant.password,
      uid: mockUsers.data[1].uid
    });

    const r = await signInWithEmailAndPassword(frontAuth, participant.email, participant.password);
    accessToken = await r.user.getIdToken(false);
    const r2 = await signInWithEmailAndPassword(frontAuth, email, password);
    accessToken2 = await r2.user.getIdToken(false);
    return Promise.all(collects.map(collect => collect.populate()));
  });

  afterAll(async () => {
    await deleteAllUsers();
    await gtDeleteAllEvents();
    return Promise.all(collects.map(collect => collect.clean()));
  }, 10000);

  const sessions = [
    moment().utcOffset(-4).add(1, "hour").startOf("hour").format("YYYY-MM-DD HH:mm"),
    moment().utcOffset(-4).add(3, "day").add(1, "hour").startOf("hour").format("YYYY-MM-DD HH:mm"),
    moment().utcOffset(-4).add(7, "day").add(1, "hour").startOf("hour").format("YYYY-MM-DD HH:mm")
  ];

  const sessions2 = [
    moment().utcOffset(-4).add(3, "hour").startOf("hour").format("YYYY-MM-DD HH:mm"),
    moment().utcOffset(-4).add(3, "day").add(3, "hour").startOf("hour").format("YYYY-MM-DD HH:mm"),
    moment().utcOffset(-4).add(7, "day").add(3, "hour").startOf("hour").format("YYYY-MM-DD HH:mm")
  ];

  it("should be able to schedule sessions with researcher", async () => {
    const response = await chai
      .request(server)
      .post("/api/participants/schedule")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        project,
        sessions
      });
    expect(response.status).toEqual(200);
  });

  let resSchedules = [];

  it("relative resSchedule document(s) should be updated", async () => {
    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
    if (!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    const _resSchedules = await db
      .collection("resSchedule")
      .where("project", "==", project)
      .where("month", "in", scheduleMonths)
      .get();
    resSchedules = _resSchedules.docs;

    let totalSlots = 0;

    for (const resSchedule of resSchedules) {
      const resScheduleData = resSchedule.data();
      totalSlots += Object.values(resScheduleData?.scheduled?.[fullname]?.[participant.fullname] || {}).length;
    }

    expect(totalSlots).toEqual(4);
  });

  it("can't book overlapping schedule with other participant with same researcher", async () => {
    const response = await chai
      .request(server)
      .post("/api/participants/schedule")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken2)
      .send({
        project,
        sessions
      });
    expect(response.status).toEqual(400);
  });

  it("participant should be able to reschedule their session", async () => {
    const response = await chai
      .request(server)
      .post("/api/participants/schedule")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        project,
        sessions: sessions2
      });
    expect(response.status).toEqual(200);
  });

  it("relative resSchedule document(s) should be updated after reschedule", async () => {
    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
    if (!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    const _resSchedules = await db
      .collection("resSchedule")
      .where("project", "==", project)
      .where("month", "in", scheduleMonths)
      .get();
    resSchedules = _resSchedules.docs;

    let totalSlots = 0;

    for (const resSchedule of resSchedules) {
      const resScheduleData = resSchedule.data();
      totalSlots += Object.values(resScheduleData?.scheduled?.[fullname]?.[participant.fullname] || {}).length;
    }

    expect(totalSlots).toEqual(4);
  }, 10000);
});
