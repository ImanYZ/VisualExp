const chai = require("chai");
const http = require("http");
const moment = require("moment");
const chaiHttp = require('chai-http');
const app = require("../../app");
const {
  MockData, deleteAllUsers, mockProjectSpecs,
  mockPassages, mockConditions, mockUsers,
  mockResearchers, mockResSchedule
} = require("../../testUtils");
const { auth: frontAuth } = require("../../testUtils/firestore");
const { db, admin } = require("../../admin");
const {expect, describe, beforeAll, afterAll, beforeEach} = require('@jest/globals');
const { getAuth } = require('firebase-admin/auth');
const { signInWithEmailAndPassword } = require("firebase/auth");
const { gtDeleteAllEvents } = require("../../testUtils/gtCalendar");

const server = http.createServer(app);
chai.use(chaiHttp);

describe("assignExpPoints", () => {

  describe("for participant experiement session", () => {

    const fullname = "Sam Ouhra";
    const email = "ouhrac@gmail.com";
    const password = "sam2022";
    const project = "H1L2";
    let accessToken = "";

    beforeEach(async () => {
      const auth = getAuth(admin);
      await auth.createUser({
        displayName: fullname,
        email,
        emailVerified: true,
        password,
        uid: mockUsers.data[0].uid
      })
    })
  })

  describe("for survey session", () => {

  })
})