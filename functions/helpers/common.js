import { db } from "../admin";

exports.delay = async time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

exports.getUserDocsfromEmail = async email => {
  let userDocs = await db.collection("users").where("email", "==", email).get();
  const usersSurveyDocs = await db.collection("usersSurvey").where("email", "==", email).get();
  return [...userDocs.docs, ...usersSurveyDocs.docs];
};
