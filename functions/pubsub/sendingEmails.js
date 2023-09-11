const { db } = require("../admin");
const moment = require("moment-timezone");
const cityTimezones = require("city-timezones");
const nodemailer = require("nodemailer");
const { Timestamp, FieldValue } = require("@google-cloud/firestore");
const { nextWeek } = require("../utils");
const { delay } = require("../helpers/common");

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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS
  }
});

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
          transporter.sendMail(mailOptions, async (error, data) => {
            if (error) {
              console.log("sendMail", { error });
              throw error;
            } else {
              const emailRef = db.collection("emails").doc(emailData.id);
              if (reason === "instructor") {
                const instructorRef = db.collection("instructors").doc(documentId);
                await instructorRef.update({
                  emailedAt: Timestamp.fromDate(new Date()),
                  reminders: FieldValue.increment(1),
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
            }
          });
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
