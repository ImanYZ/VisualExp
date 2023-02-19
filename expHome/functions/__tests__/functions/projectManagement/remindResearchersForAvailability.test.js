const {
  mockUsers,
  MockData,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockResearchers,
  mockResSchedule
} = require("../../../testUtils");

const { Timestamp } = require("firebase-admin/firestore");
const lodash = require("lodash");
const moment = require("moment");

// mock to stop sending emails and detect function calls
jest.mock("../../../emailing", () => {
  const original = jest.requireActual("../../../emailing");
  return {
    ...original,
    remindResearcherToSpecifyAvailability: jest.fn().mockImplementation(async () => {
      return;
    })
  };
});

// mock to disable delays
jest.mock("../../../helpers/common", () => {
  const original = jest.requireActual("../../../helpers/common");
  return {
    ...original,
    delay: jest.fn().mockImplementation(async () => {
      return;
    })
  };
});

const {
  expect,
  describe,
  beforeAll,
  afterAll
} = require('@jest/globals');
const { remindResearchersForAvailability } = require("../../../projectManagement");
const { remindResearcherToSpecifyAvailability } = require("../../../emailing");
const { db } = require("../../../admin");

describe("projectManagement.remindResearchersForAvailability", () => {
  const _mockResearchers = [...mockResearchers.data];
  _mockResearchers[0].projects["H1L2"].scheduleSessions = true;

  // month for next 10 days
  const month = moment().utcOffset(-4).add(10, "days").startOf("month").format("YYYY-MM-DD");

  const _mockResSchedules = [...mockResSchedule.data];
  let resIdx = _mockResSchedules.findIndex((resSchedule) => resSchedule.month === month);
  if(resIdx === -1) {
    _mockResSchedules.push(lodash.cloneDeep(_mockResSchedules[0]));
    resIdx = _mockResSchedules.length - 1;
  }
  const _mockResSchedule = _mockResSchedules[resIdx];
  _mockResSchedule.documentId = month;
  _mockResSchedule.month = month;
  _mockResSchedule.schedules[_mockResearchers[0].documentId] = []; // empty for start
  
  const resSchedulesMock = new MockData(_mockResSchedules, "resSchedule");

  const collects = [
    mockUsers,
    new MockData([], "userLogs"),
    mockProjectSpecs,
    mockPassages,
    mockConditions,
    new MockData(_mockResearchers, "researchers"),
    resSchedulesMock
  ];

  beforeAll(async () => {
    await Promise.all(collects.map(collect => collect.populate()));
    return remindResearchersForAvailability({});
  })

  afterAll(async () => {
    remindResearcherToSpecifyAvailability.mockReset(); // reseting mock
    return Promise.all(collects.map(collect => collect.clean()));
  }, 10000);

  it("remind researcher if their last availability is less than next 10 days", () => {
    expect(remindResearcherToSpecifyAvailability?.mock?.calls?.length).toEqual(1);
    remindResearcherToSpecifyAvailability.mockReset();
  })

  it("don't remind researcher if their last availability is equal or greater than next 10 days", async () => {
    await resSchedulesMock.clean();
    _mockResSchedule.schedules[_mockResearchers[0].documentId].push(
      moment().utcOffset(-4).startOf("day").add(10, "days").format("YYYY-MM-DD HH:mm:ss")
    );
    await resSchedulesMock.populate();
    await remindResearchersForAvailability({});
    expect(remindResearcherToSpecifyAvailability?.mock?.calls?.length).toEqual(0)
  })

})