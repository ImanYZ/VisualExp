const { db } = require("../admin");
const moment = require("moment-timezone");
const cityTimezones = require("city-timezones");
const nodemailer = require("nodemailer");
const { Timestamp, FieldValue } = require("@google-cloud/firestore");
const { nextWeek } = require("../utils");
const { delay } = require("../helpers/common");
const { google } = require("googleapis");

const isTimeToSendEmail = (city = "", state = "", country = "", ignore = false) => {
  if (ignore) return true;
  state = state.split(";")[1] || "";
  country = country.split(";")[1] || "";
  if (!cityTimezones.lookupViaCity(city) || cityTimezones.lookupViaCity(city).length === 0) {
    city = "Ann Arbor";
  }
  const cityDetails = (cityTimezones.lookupViaCity(city) || []).find(detail => {
    return (
      (detail.hasOwnProperty("state_ansi") && detail.state_ansi.toLowerCase() === state.toLowerCase()) ||
      (detail.hasOwnProperty("iso2") && detail.iso2.toLowerCase() === country.toLowerCase())
    );
  });

  const timezone = cityDetails?.timezone;
  if (timezone) {
    let hour = moment().tz(timezone).hour();
    if (hour >= 7 && hour <= 19) {
      return true;
    }
  }
  return false;
};

const sendMail = async mailOptions => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("sendMail");
      const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
      );
      oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
      });
      const accessToken = await oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "community@1cademy.com",
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken
        }
      });
      const result = await transporter.sendMail(mailOptions);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = async context => {
  try {
    const emailsDocs = await db.collection("emails").where("sent", "==", false).get();
    let emails = emailsDocs.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
    emails = [
      ...emails.filter(e => e.urgent),
      ...emails.filter(e => e.reason === "instructor"),
      ...emails.filter(e => e.reason === "administrator")
    ];
    console.log(emails.length);
    for (let emailData of emails) {
      const emailDoc = await db.collection("emails").doc(emailData.id).get();
      const _emailData = emailDoc.data();
      const { documentId, mailOptions, reason, city, stateInfo, country, email, sent } = _emailData;
      const isInstAdmin = reason === "instructor" || reason === "administrator";
      if (
        isTimeToSendEmail(city, stateInfo, country, !isInstAdmin) &&
        email &&
        sent === false &&
        email !== "ouhrac@gmail.com"
      ) {
        console.log("sending email to", email, "for", reason, "with id", emailData.id);
        try {
          sendMail(mailOptions).then(
            async result => {
              const emailRef = db.collection("emails").doc(emailData.id);
              console.log("result", result);
              if (reason === "instructor") {
                const instructorRef = db.collection("instructors").doc(documentId);
                await instructorRef.update({
                  emailedAt: Timestamp.fromDate(new Date()),
                  newReminders: FieldValue.increment(1),
                  nextReminder: Timestamp.fromDate(nextWeek()),
                  updatedAt: Timestamp.fromDate(new Date()),
                  emailNumber: emailData.emailNumber
                });
              } else if (reason === "administrator") {
                const administratorRef = db.collection("administrators").doc(documentId);
                await administratorRef.update({
                  emailedAt: Timestamp.fromDate(new Date()),
                  reminders: FieldValue.increment(1),
                  nextReminder: Timestamp.fromDate(nextWeek()),
                  updatedAt: Timestamp.fromDate(new Date())
                });
              } else if (reason === "emailApplicationStatus") {
                const userQuery = db.collection("users").where("email", "==", email.toLowerCase());
                let userDoc = await userQuery.get();
                if (!userDoc.docs.length) {
                  const userQuery = db.collection("usersSurvey").where("email", "==", email.toLowerCase());
                  userDoc = await userQuery.get();
                }
                if (userDoc.docs.length > 0) {
                  await userDoc.docs[0].ref.update({
                    reminders: FieldValue.increment(1),
                    reminder: Timestamp.fromDate(nextWeek())
                  });
                }
              }
              await emailRef.update({
                sent: true,
                sentAt: Timestamp.fromDate(new Date())
              });
            },
            rejected => {
              console.log(rejected);
              throw rejected;
            }
          );
        } catch (error) {
          if (error.code === "EAUTH") {
            break;
          }
        }
        // We don't want to send many emails at once, because it may drive Gmail crazy.
        // we have  waitTime by a random integer between 10 to 40 seconds.
        const waitTime = 1000 * Math.floor(Math.random() * 31) + 10;
        await delay(waitTime);
      }
    }

    console.log("Done");
  } catch (error) {
    console.log(error);
  }
};
