import { atom } from "recoil";

export const projectsState = atom({
  key: "projectsState",
  default: [],
});

export const projectState = atom({
  key: "projectState",
  default: "",
});

export const activePageState = atom({
  key: "activePageState",
  default: "Intellectual",
});

export const notAResearcherState = atom({
  key: "notAResearcherState",
  default: true,
});

export const notTakenSessionsState = atom({
  key: "notTakenSessionsState",
  default: [],
});

export const notTakenSessionsLoadedState = atom({
  key: "notTakenSessionsLoadedState",
  default: false,
});

export const upVotedTodayState = atom({
  key: "upVotedTodayState",
  default: 0,
});

export const instructorsState = atom({
  key: "instructorsState",
  default: [],
});

export const othersInstructorsState = atom({
  key: "othersInstructorsState",
  default: [],
});

export const otherInstructorState = atom({
  key: "otherInstructorState",
  default: {},
});

export const instructorsTodayState = atom({
  key: "instructorsTodayState",
  default: 0,
});

export const upvotedInstructorsTodayState = atom({
  key: "upvotedInstructorsTodayState",
  default: 0,
});
