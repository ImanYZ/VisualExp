const {
  MockData,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockUsers,
  mockResearchers,
  mockRecallGradesV2,
  mockSchedules,
  mockFeedbackCodes,
  writeTransaction
} = require("../../testUtils");
const { db } = require("../../admin");
const { expect, describe, beforeEach, afterEach } = require("@jest/globals");
const { gtDeleteAllEvents } = require("../../testUtils/gtCalendar");
const { assignExpPoints } = require("../../helpers/assignExpPoints");
describe("assignExpPoints", () => {
  describe("for participant experiement session", () => {
    const researcher = mockResearchers.data[0].documentId;

    const _mockRecallGrades = [...mockRecallGradesV2.data];

    // updating mock data for point distribution
    ["1st", "2nd", "3rd"].forEach(session => {
      _mockRecallGrades[0]["sessions"][session][0].researchers.push(researcher);
      _mockRecallGrades[0]["sessions"][session][1].researchers.push(researcher);
    });

    const _mockFeedbackCodes = [...mockFeedbackCodes.data];
    _mockFeedbackCodes[0].coders.push("Sam Ouhra");

    let _mockSchedules = [...mockSchedules.data];
    _mockSchedules = _mockSchedules.map(schedule => ({ ...schedule, hasStarted: true }));

    const collects = [
      mockUsers,
      new MockData(_mockSchedules, "schedule"),
      new MockData([], "expSessions"),
      new MockData([], "researcherLogs"),
      new MockData(_mockRecallGrades, "recallGradesV2"),
      mockProjectSpecs,
      mockPassages,
      mockConditions,
      mockResearchers,
      new MockData(_mockFeedbackCodes, "feedbackCodes")
    ];

    const participant = mockUsers.data[1].documentId;
    const project = mockUsers.data[1].project;

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await gtDeleteAllEvents();
      return Promise.all(collects.map(collect => collect.clean()));
    });

    it("researcher should get points for 1st session", async () => {
      const researcherDoc = await db.collection("researchers").doc(researcher).get();
      const researcherData = researcherDoc.data();
      let researchersUpdates = {
        [researcher]: researcherData
      };
      await db.runTransaction(async t => {
        let transactionWrites = [];
        await assignExpPoints({
          researcher: { docId: researcher, ...researcherData },
          participant,
          session: "1st",
          project,
          recallGradeData: _mockRecallGrades[0],
          feedbackCodeData: _mockFeedbackCodes[0],
          eventId: "",
          transactionWrites,
          researchersUpdates,
          t
        });
        await writeTransaction(transactionWrites, t);
      });
      expect(researchersUpdates[researcher].projects[project].expPoints).toEqual(16);
    });

    it("researcher should get points for 2nd session", async () => {
      const researcherDoc = await db.collection("researchers").doc(researcher).get();
      const researcherData = researcherDoc.data();
      let researchersUpdates = {
        [researcher]: researcherData
      };
      await db.runTransaction(async t => {
        let transactionWrites = [];
        await assignExpPoints({
          researcher: { docId: researcher, ...researcherData },
          participant,
          session: "2nd",
          recallGradeData: _mockRecallGrades[0],
          feedbackCodeData: _mockFeedbackCodes[0],
          project,
          researchersUpdates,
          transactionWrites,
          t
        });
        await writeTransaction(transactionWrites, t);
      });
      expect(researchersUpdates[researcher].projects[project].expPoints).toEqual(10);
    });

    it("researcher should get points for 3rd session", async () => {
      const researcherDoc = await db.collection("researchers").doc(researcher).get();
      const researcherData = researcherDoc.data();
      let researchersUpdates = {
        [researcher]: researcherData
      };
      await db.runTransaction(async t => {
        let transactionWrites = [];
        await assignExpPoints({
          researcher: { docId: researcher, ...researcherData },
          participant,
          session: "2nd",
          recallGradeData: _mockRecallGrades[0],
          feedbackCodeData: _mockFeedbackCodes[0],
          project,
          researchersUpdates,
          transactionWrites,
          t
        });
        await writeTransaction(transactionWrites, t);
      });
      expect(researchersUpdates[researcher].projects[project].expPoints).toEqual(10);
    });
  });

  describe("for survey sessions", () => {
    const researcher = mockResearchers.data[0].documentId;
    const participant = mockUsers.data[1].documentId;
    const project = mockUsers.data[1].project;

    let _mockSchedules = [...mockSchedules.data];
    _mockSchedules = _mockSchedules.map(schedule => ({ ...schedule, hasStarted: true }));

    const collects = [
      mockUsers,
      new MockData([], "expSessions"),
      new MockData([], "researcherLogs"),
      new MockData(_mockSchedules, "schedule"),
      mockProjectSpecs,
      mockPassages,
      mockConditions,
      mockResearchers
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await gtDeleteAllEvents();
      return Promise.all(collects.map(collect => collect.clean()));
    });

    it("researcher should get points for taking session with survey participant", async () => {
      const researcherDoc = await db.collection("researchers").doc(researcher).get();
      const researcherData = researcherDoc.data();
      let researchersUpdates = {
        [researcher]: researcherData
      };
      await db.runTransaction(async t => {
        let transactionWrites = [];
        await assignExpPoints({
          researcher: { docId: researcher, ...researcherData },
          participant,
          session: "1st",
          project,
          checkRecallgrading: false,
          eventId: "",
          researchersUpdates,
          transactionWrites,
          t
        });
        await writeTransaction(transactionWrites, t);
      });
      expect(researchersUpdates[researcher].projects[project].expPoints).toEqual(16);
    });

    it("researcher should get points for taking session with survey participant (Annotating)", async () => {
      const researcherDoc = await db.collection("researchers").doc(researcher).get();
      const researcherData = researcherDoc.data();
      let researchersUpdates = {
        [researcher]: researcherData
      };
      await db.runTransaction(async t => {
        let transactionWrites = [];
        await assignExpPoints({
          researcher: { docId: researcher, ...researcherData },
          participant,
          session: "1st",
          project: "Annotating",
          checkRecallgrading: false,
          eventId: "",
          researchersUpdates,
          transactionWrites,
          t
        });
        await writeTransaction(transactionWrites, t);
      });
      expect(researcherData.projects["Annotating"].expPoints).toEqual(10);
    });
  });
});
