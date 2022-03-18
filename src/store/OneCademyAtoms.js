import { atom } from "recoil";
import { firebaseOnecademy } from "../Components/firebase/firebase";

export const firebaseOnecademyState = atom({
  key: "firebaseOnecademyState",
  default: firebaseOnecademy,
  dangerouslyAllowMutability: true,
});

export const emailState = atom({
  key: "emailState",
  default: "",
});

export const usernameState = atom({
  key: "usernameState",
  default: "",
});
