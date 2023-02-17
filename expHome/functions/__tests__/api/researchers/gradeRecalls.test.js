const chai = require("chai");
const http = require("http");
const moment = require("moment");
const chaiHttp = require('chai-http');
const {
  MockData,
  deleteAllUsers,
  mockProjectSpecs,
  mockPassages,
  mockConditions,
  mockUsers,
  mockResearchers,
  mockRecallGradesV2,
  mockBooleanScratch
} = require("../../../testUtils");
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
    mockProjectSpecs,
    mockPassages,
    mockConditions,
    mockResearchers,
    mockRecallGradesV2,
    mockBooleanScratch
  ];

  const gptResearcher = "Iman YeckehZaare";

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

  const otherResearchers = [
    "Haroon Waheed",
    "Iman",
    "Ukasha Tariq"
  ];

  const payload = {
    voterProject: project,
    recallGrade: {
      docId: mockRecallGradesV2.data[0].documentId,
      project,
      session: "1st",
      user: "Ameer Hamza",
      viewers: [],
      researchers: [],
      passage: "6rc4k1su3txN6ZK4CJ0h",
      response: "The passage was about trap-jaw ants. These ants have powerful mandibles that get up to high speed to attack their prey. The mandible decelerates right before closing so the ants' jaws do not break. The bounce defense (?) probably evolved accidentally. In addition to the bounce defense, another defense that these ants use is the escape jump. During one of their defenses, the ants propel both themselves and their intruders in different directions. These ants are from Central and South America. ",
      condition: "H1",
      phrases: [
        {
          "grades": [],
          "phrase": "Barn owls locate prey by having sensitivity to differences in loudness KL",
          "researchers": []
        },
        {
          "grades": [],
          "phrase": "The face structure of barn owls improves sound location range and range",
          "researchers": []
        },
        {
          "grades": [],
          "phrase": "The face structure of barn owls contains two troughs",
          "researchers": []
        },
        {
          "grades": [],
          "phrase": "Barn owls must organize and interpret sound information",
          "researchers": []
        },
        {
          "grades": [true],
          "grade": true,
          "phrase": "Barn owl's life depends on hearing",
          "researchers": [ fullname ]
        }
      ]
    },
    viewedPhrases: [
      "Barn owls locate prey by having sensitivity to differences in loudness KL",
      "The face structure of barn owls improves sound location range and range",
      "The face structure of barn owls contains two troughs",
      "Barn owls must organize and interpret sound information",
      "Barn owl's life depends on hearing"
    ]
  };

  it("should be able to grade recalls as researcher", async () => {
    const response = await chai.request(server).post("/api/researchers/gradeRecalls")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send(payload);
    expect(response.status).toEqual(200)
  }, 10000)

  let recallGradeData = {};

  it("updated document should have vote by researcher in correct session and condition", async () => {
    const recallGrade = await db.collection("recallGradesV2").doc(mockRecallGradesV2.data[0].documentId).get();
    recallGradeData = recallGrade.data();
    const conditionIdx = recallGradeData.sessions["1st"].findIndex((conditionItem) => conditionItem.condition === "H1");
    const condition = recallGradeData.sessions["1st"][conditionIdx];

    const phrase = condition.phrases.find((phrase) => phrase.phrase === "Barn owl's life depends on hearing");
    const researcherIdx = phrase.researchers.indexOf(fullname);

    expect(phrase.researchers.includes(fullname)).toBeTruthy();
    expect(phrase.grades[researcherIdx]).toBeTruthy();

    expect(condition.researchers.includes(fullname)).toBeTruthy();
  })

  it("updated document should automatically have false value for other phrases that where viewed", async () => {
    const conditionIdx = recallGradeData.sessions["1st"].findIndex((conditionItem) => conditionItem.condition === "H1");
    const condition = recallGradeData.sessions["1st"][conditionIdx];

    for(const viewedPhrase of payload.viewedPhrases) {
      const phrase = condition.phrases.find((phrase) => phrase.phrase === viewedPhrase);
      expect(phrase.researchers.includes(fullname)).toBeTruthy();
    }
  })

  it("updated document should not touch non viewed phrases", async () => {
    const conditionIdx = recallGradeData.sessions["1st"].findIndex((conditionItem) => conditionItem.condition === "H1");
    const condition = recallGradeData.sessions["1st"][conditionIdx];

    const nonViewedPhrases = condition.phrases.filter((phrase) => !payload.viewedPhrases.includes(phrase.phrase));
    for(const nonViewedPhrase of nonViewedPhrases) {
      expect(nonViewedPhrase.researchers.includes(fullname)).toBeFalsy();
    }
  })

  it("check if a session considered as done when we have 4 researchers on each satisfying phrase", async () => {
    const recallGradeRef = db.collection("recallGradesV2").doc(mockRecallGradesV2.data[0].documentId);
    const recallGradeUpdates = {...recallGradeData};
    const { sessions } = recallGradeUpdates;
    const session = sessions["1st"] || [];
    const conditionIdx = session.findIndex((conditionItem) => conditionItem.condition === "H1");
    const conditionItem = session[conditionIdx];
    const phrase = conditionItem.phrases.find((phrase) => phrase.phrase === "Barn owl's life depends on hearing");
    phrase.researchers = [...otherResearchers];
    phrase.grades = [true, true, false]; // keeping last as false to validate disagreement points

    await recallGradeRef.update(recallGradeUpdates);

    await chai.request(server).post("/api/researchers/gradeRecalls")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send(payload);
    
    const recallGrade = await recallGradeRef.get();
    recallGradeData = recallGrade.data();

    expect(recallGradeData.sessions["1st"][conditionIdx].done).toBeTruthy()

  })

  it("check if all the researchers whom voted on a phrase received points", async () => {
    const _otherResearchers = [...otherResearchers];
    const disagreeingResearchers = _otherResearchers.splice(otherResearchers.length-1);
    const agreeingResearchers = [..._otherResearchers, fullname];

    const researchers = await db.collection("researchers").where("__name__", "in", [...disagreeingResearchers, ...agreeingResearchers]).get();
    
    for(let researcher of researchers.docs) {
      const researcherData = researcher.data();
      if(agreeingResearchers.includes(researcher.id)) {
        expect(researcherData.projects[project].gradingPoints).toEqual(0.5); // agreement points
      } else {
        expect(researcherData.projects[project].gradingPoints).toEqual(-0.5); // disagreement points
      }
    }
  })

  it("gpt researcher should not receive points for phrase", async () => {
    const recallGradeRef = db.collection("recallGradesV2").doc(mockRecallGradesV2.data[0].documentId);
    const recallGradeUpdates = {...recallGradeData};
    const { sessions } = recallGradeUpdates;
    const session = sessions["1st"] || [];
    const conditionIdx = session.findIndex((conditionItem) => conditionItem.condition === "H1");
    const conditionItem = session[conditionIdx];
    const phrase = conditionItem.phrases.find((phrase) => phrase.phrase === "Barn owl's life depends on hearing");
    phrase.researchers = [...otherResearchers, gptResearcher];
    phrase.grades = [true, true, false, true];

    await recallGradeRef.update(recallGradeUpdates);

    await chai.request(server).post("/api/researchers/gradeRecalls")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + accessToken)
      .send(payload);

    const _otherResearchers = [...otherResearchers];
    const disagreeingResearchers = _otherResearchers.splice(otherResearchers.length-1);
    const agreeingResearchers = [..._otherResearchers, fullname];

    const researchers = await db.collection("researchers").where("__name__", "in", [...disagreeingResearchers, ...agreeingResearchers, gptResearcher]).get();
    
    for(let researcher of researchers.docs) {
      const researcherData = researcher.data();
      if(agreeingResearchers.includes(researcher.id)) {
        expect(researcherData.projects[project].gradingPoints).toEqual(0.5); // agreement points
      } else if(gptResearcher === researcher.id) { // gpt researcher should not get points
        expect(researcherData.projects[project].gradingPoints).toEqual(undefined);
      } else {
        expect(researcherData.projects[project].gradingPoints).toEqual(-0.5); // disagreement points
      }
    }
  });

  it("participant should get recall grade points on phrase approval", async () => {
    const conditionIdx = recallGradeData.sessions["1st"].findIndex((conditionItem) => conditionItem.condition === "H1");
    const condition = recallGradeData.sessions["1st"][conditionIdx];
    const user = await db.collection("users").doc(payload.recallGrade.user).get();
    const userData = user.data();

    const passageIdx = (userData?.pConditions || []).findIndex((pConditionItem) => pConditionItem.passage === payload.recallGrade.passage);
    const grades = userData?.pConditions?.[passageIdx]?.["recallreGrade"] || 0; // first session grades

    const gradeRatio = userData?.pConditions?.[passageIdx]?.["recallreGradeRatio"] || 0;
    const expectedGradeRatio = parseFloat((grades / (condition?.phrases?.length || 1)).toFixed(2));

    expect(gradeRatio).toEqual(expectedGradeRatio);
  })
})