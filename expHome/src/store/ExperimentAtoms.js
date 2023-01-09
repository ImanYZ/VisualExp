import { atom } from "recoil";
import AppConfig from '../AppConfig'

export const currentProjectState = atom({
  key: "currentProjectState",
  default: AppConfig.defaultProject,
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

export const startedSessionState = atom({
  key: "startedSession",
  default: 0,
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

export const personalInfoProcessChoicesState = atom({
  key: "personalInfoProcessChoicesState",
  default: {
    submit: false,
    submitEnabled: false
  }
})