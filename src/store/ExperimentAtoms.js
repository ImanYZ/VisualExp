import { atom } from "recoil";

export const currentProjectState = atom({
  key: "currentProjectState",
  default: "H2K2",
});

export const hasScheduledState = atom({
  key: "hasScheduledState",
  default: false,
});

export const completedExperimentState = atom({
  key: "completedExperimentState",
  default: false,
});

export const phaseState = atom({
  key: "phaseState",
  default: 0,
});

export const secondSessionState = atom({
  key: "secondSessionState",
  default: false,
});

export const thirdSessionState = atom({
  key: "thirdSessionState",
  default: false,
});

export const stepState = atom({
  key: "stepState",
  default: 0,
});

export const passageState = atom({
  key: "passageState",
  default: "",
});

export const conditionState = atom({
  key: "conditionState",
  default: "",
});

export const nullPassageState = atom({
  key: "nullPassageState",
  default: "",
});

export const choicesState = atom({
  key: "choicesState",
  default: [],
});
