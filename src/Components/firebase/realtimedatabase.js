import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBp9kzfQ-g1qdld9W68Bmrs_aS7rgSWFHs",
  authDomain: "visualexp-a7d2c.firebaseapp.com",
  projectId: "visualexp-a7d2c",
  storageBucket: "visualexp-a7d2c.appspot.com",
  messagingSenderId: "141114383555",
  appId: "1:141114383555:web:0668953725936df8f11676",
  measurementId: "G-0BH5YRED86",
  databaseURL: "https://visualexp-a7d2c-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig, "realtime");

export const database = getDatabase(app);
