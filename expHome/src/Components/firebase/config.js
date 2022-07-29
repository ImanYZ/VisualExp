const firebaseDevConfig = {
  apiKey: "AIzaSyCLYan1Q1vda3eed70rRoajMLUSHZfySFc",
  authDomain: "visualexp-5d2c6.firebaseapp.com",
  projectId: "visualexp-5d2c6",
  storageBucket: "visualexp-5d2c6.appspot.com",
  messagingSenderId: "1088807277176",
  appId: "1:1088807277176:web:48a3003ddd629bcb07138d",
  measurementId: "G-075YRXFSRR"
};

const firebaseProdConfig = {
  apiKey: "AIzaSyBp9kzfQ-g1qdld9W68Bmrs_aS7rgSWFHs",
  authDomain: "visualexp-a7d2c.firebaseapp.com",
  projectId: "visualexp-a7d2c",
  storageBucket: "visualexp-a7d2c.appspot.com",
  messagingSenderId: "141114383555",
  appId: "1:141114383555:web:0668953725936df8f11676",
  measurementId: "G-0BH5YRED86"
};

const config = (() => {
  if (process.env.REACT_APP_ENV === "development") return firebaseDevConfig;
  if (process.env.REACT_APP_ENV === "production") return firebaseProdConfig;
  return firebaseDevConfig;
})();

// Your web app's Firebase configuration
export const firebaseConfig = config;

export const firebaseOneConfig = {
  apiKey: "AIzaSyAl1Lfmndsmvax6PZVH48nwV0kEaBOVgDE",
  authDomain: "onecademy-1.firebaseapp.com",
  databaseURL: "https://onecademy-1.firebaseio.com",
  projectId: "onecademy-1",
  storageBucket: "onecademy-1.appspot.com",
  messagingSenderId: "731671946677",
  appId: "1:731671946677:web:75dc8935cee89bd4"
};
