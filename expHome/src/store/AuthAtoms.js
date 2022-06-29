import { atom } from "recoil";
import { firebase } from "../Components/firebase/firebase";

export const firebaseState = atom({
  key: "firebaseState",
  default: firebase,
  dangerouslyAllowMutability: true,
});

export const emailState = atom({
  key: "emailState",
  default: "",
});

export const emailVerifiedState = atom({
  key: "emailVerifiedState",
  default: "NotSent",
});

export const fullnameState = atom({
  key: "fullnameState",
  default: "",
});

export const resumeUrlState = atom({
  key: "resumeUrlState",
  default: "",
});

export const transcriptUrlState = atom({
  key: "transcriptUrlState",
  default: "",
});

export const isAdminState = atom({
  key: "isAdminState",
  default: false,
});

export const leadingState = atom({
  key: "leadingState",
  default: [],
});

export const applicationsSubmittedState = atom({
  key: "applicationsSubmittedState",
  default: {},
});

export const communiTestsEndedState = atom({
  key: "communiTestsEndedState",
  default: {},
});

export const themeState = atom({
  key: "themeState",
  default: "Dark",
});

export const themeOSState = atom({
  key: "themeOSState",
  default: "Dark",
});

export const colorModeState = atom({
  key: "colorModeState",
  default: "light",
});

export const fromIranState = atom({
  key: "fromIranState",
  default: false,
});
