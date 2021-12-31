import { atom } from "recoil";
import { firebase, firebaseOnecademy } from "../Components/firebase/firebase";

export const firebaseState = atom({
  key: "firebaseState",
  default: firebase,
  dangerouslyAllowMutability: true,
});

export const emailState = atom({
  key: "emailState",
  default: "",
});

export const fullnameState = atom({
  key: "fullnameState",
  default: "",
});

export const isAdminState = atom({
  key: "isAdminState",
  default: false,
});

export const themeState = atom({
  key: "themeState",
  default: "Dark",
});

export const themeOSState = atom({
  key: "themeOSState",
  default: "Dark",
});
