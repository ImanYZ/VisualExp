const {
  mockUsers,
  MockData,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockResearchers,
  mockApplications
} = require("../../../testUtils");

// mock to stop sending emails and detect function calls
jest.mock("../../../emailing", () => {
  const original = jest.requireActual("../../../emailing");
  return {
    ...original,
    emailApplicationStatus: jest.fn().mockImplementation(async () => {
      return;
    }),
    emailCommunityLeader: jest.fn().mockImplementation(async () => {
      return;
    }),
    emailImanToInviteApplicants: jest.fn().mockImplementation(async () => {
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
const { applicationReminder } = require("../../../users");
const { emailApplicationStatus, emailCommunityLeader, emailImanToInviteApplicants } = require("../../../emailing");

describe("users.applicationReminder", () => {

  describe("application status email", () => {
    const _mockUsers = [...mockUsers.data];
    for(const mockUser of _mockUsers) {
      mockUser.projectDone = true;
      mockUser.applicationSubmitted = {};
    }

    const collects = [
      new MockData(_mockUsers, "users"),
      new MockData([], "userLogs"),
      mockProjectSpecs,
      mockPassages,
      mockConditions,
      mockResearchers
    ];
  
    beforeAll(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
      return applicationReminder({});
    })
  
    afterAll(async () => {
      emailApplicationStatus.mockReset(); // reseting it for next describe
      return Promise.all(collects.map(collect => collect.clean()));
    }, 10000);
  
    it("should be able to send email to users who completed experiements", async () => {
      expect(emailApplicationStatus?.mock?.calls?.length).toEqual(_mockUsers.length)
    });
  })

  describe("community leader email", () => {
    const _users = [...mockUsers.data];
    const _applictions = [...mockApplications.data.map((record) => ({...record}))];
    _users[0].leading = [_applictions[0].communiId];
    _applictions[0].ended = true;

    const collects = [
      new MockData(_applictions, "applications"),
      new MockData(_users, "users"),
      new MockData([], "userLogs"),
      mockProjectSpecs,
      mockPassages,
      mockConditions,
      mockResearchers
    ];
  
    beforeAll(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
      return applicationReminder({});
    })
  
    afterAll(async () => {
      emailCommunityLeader.mockReset(); // reseting it for next describe
      return Promise.all(collects.map(collect => collect.clean()));
    }, 10000);
  
    it("should be able to send email to community leader for in review applications", async () => {
      expect(emailCommunityLeader?.mock?.calls?.length).toEqual(1)
    });
  })

  describe("remind iman for inviting applicants that are not invited yet", () => {
    const _users = [...mockUsers.data];
    const _applictions = [...mockApplications.data.map((item) => ({...item}))];
    _users[0].leading = [_applictions[0].communiId];
    _applictions[0].confirmed = true;
    _applictions[0].invited = false;
    _applictions[0].ended = true;

    const collects = [
      new MockData(_applictions, "applications"),
      new MockData(_users, "users"),
      new MockData([], "userLogs"),
      mockProjectSpecs,
      mockPassages,
      mockConditions,
      mockResearchers
    ];
  
    beforeAll(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
      return applicationReminder({});
    })
  
    afterAll(async () => {
      emailImanToInviteApplicants.mockReset(); // reseting it for next describe
      return Promise.all(collects.map(collect => collect.clean()));
    }, 10000);
  
    it("should be able to send email to iman for confirmed applicants that are not invited", async () => {
      // application.confirmed && !application.invited
      expect(emailImanToInviteApplicants?.mock?.calls?.length).toEqual(1)
    });
  })
})