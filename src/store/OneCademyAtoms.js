import { atom } from "recoil";
import { firebaseOne } from "../Components/firebase/firebase";

export const firebaseOneState = atom({
  key: "firebaseOneState",
  default: firebaseOne,
  dangerouslyAllowMutability: true,
});

export const emailOneState = atom({
  key: "emailOneState",
  default: "",
});

export const usernameState = atom({
  key: "usernameState",
  default: "",
});
