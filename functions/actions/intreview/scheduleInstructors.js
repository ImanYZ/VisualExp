const { db } = require("../../admin");
const moment = require("moment");
const axios = require("axios");
const { getEvents, deleteEvent } = require("../../GoogleCalendar");
const { toOrdinal } = require("number-to-words");
const { Timestamp } = require("firebase-admin/firestore");

const { getAvailableFullname } = require("../../helpers/common");

const { createExperimentEvent } = require("../../helpers/createExperimentEvent");

const getfutureEvents = async nextDays => {
  try {
    // sometimes a user has started the session earlier and the PubSub gets fired
    // and if the user has not accepted the session, it is going to send them a reminder
    // to prevent that we start an hour and a half from now.
    const start = new Date(new Date().getTime() + 90 * 60 * 1000);
    let end = new Date();
    end = new Date(end.getTime() + nextDays * 24 * 60 * 60 * 1000);
    return await getEvents(start, end, "America/Detroit");
  } catch (err) {
    console.log({ err });
    return false;
  }
};

module.exports = async (req, res) => {
  try {
    let { sessions, project, surveyType, email, firstname, lastname, institution } = req.body;
    const batch = db.batch();

    sessions.sort((a, b) => (a < b ? -1 : 1)); // asc sorting

    if (!sessions || !project) {
      throw new Error("invalid request");
    }

    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      if (
        "projects" in researcherData &&
        project in researcherData.projects &&
        researcherData.projects[project].active &&
        researcherData.projects[project].scheduleAllowed
      ) {
        researchers[researcherData.email] = researcherDoc.id;
      }
    }

    const events = await getfutureEvents(40);
    const projectSpecs = await db.collection("projectSpecs").doc(project).get();
    if (!projectSpecs.exists) {
      throw new Error("Project Specs not found.");
    }

    const projectSpecsData = projectSpecs.data();

    // 1 hour / 2 = 30 mins
    const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

    const scheduleMonths = [moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD")];
    const scheduleEnd = moment().utcOffset(-4).startOf("day").add(16, "days").startOf("month").format("YYYY-MM-DD");
    if (!scheduleMonths.includes(scheduleEnd)) {
      scheduleMonths.push(scheduleEnd);
    }

    // Retrieve all the researchers' avaialbilities in this project.
    const resScheduleDocs = await db
      .collection("resSchedule")
      .where("month", "in", scheduleMonths)
      .where("project", "==", project)
      .get();

    let availSessions = {};
    for (let resScheduleDoc of resScheduleDocs.docs) {
      const resScheduleData = resScheduleDoc.data();

      // date time flagged by researchers as available by them
      let _schedules = resScheduleData.schedules || {};
      for (const researcherFullname in _schedules) {
        for (const scheduleSlot of _schedules[researcherFullname]) {
          const slotDT = moment(scheduleSlot).utcOffset(-4, true).toDate();
          // if availability is expired already
          if (slotDT.getTime() < new Date().getTime()) {
            continue;
          }
          const _scheduleSlot = slotDT.toLocaleString();
          if (!availSessions[_scheduleSlot]) {
            availSessions[_scheduleSlot] = [];
          }
          if (Object.values(researchers).includes(researcherFullname)) {
            availSessions[_scheduleSlot].push(researcherFullname);
          }
        }
      }
      // date time already booked by participants
    }
    for (let session in availSessions) {
      const index = availSessions[session].indexOf("Iman YeckehZaare");
      if (index === -1) {
        delete availSessions[session];
      } else {
        availSessions[session].splice(index, 1);
      }
    }
    for (let event of events) {
      // First, we should figure out whether the user participated in the past:
      if (new Date(event.start.dateTime) < new Date()) {
        // Only if one of the attendees of the event is this user:
        if (
          event.attendees &&
          event.attendees.length > 0 &&
          event.attendees.findIndex(attendee => attendee.email === email) !== -1
        ) {
          // return;
        }
      }
      // Only future events
      const startTime = new Date(event.start.dateTime).toLocaleString();
      const endTime = new Date(new Date(event.end.dateTime) - 30 * 60 * 1000).toLocaleString();
      const duration = new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime();
      const startMinus30Min = new Date(new Date(event.start.dateTime).getTime() - 30 * 60 * 1000);
      if (
        event.attendees &&
        event.attendees.length > 0 &&
        startTime in availSessions &&
        event.attendees.findIndex(attendee => attendee.email === email) === -1 &&
        events.findIndex(
          eve =>
            new Date(eve.start.dateTime).getTime() === startMinus30Min.getTime() &&
            new Date(eve.start.dateTime).getTime() + 60 * 60 * 1000 === new Date(eve.end.dateTime).getTime() &&
            eve.attendees.includes(email)
        ) === -1
      ) {
        for (let attendee of event.attendees) {
          if (!researchers[attendee.email]) continue;
          if (availSessions.hasOwnProperty(startTime)) {
            delete availSessions[startTime];
            // availSessions[startTime] = availSessions[startTime].filter(resea => resea !== researchers[attendee.email]);
          }
          if (duration >= 60 * 60 * 1000 && availSessions.hasOwnProperty(endTime)) {
            delete availSessions[endTime];
            // availSessions[endTime] = availSessions[endTime].filter(resea => resea !== researchers[attendee.email]);
          }
        }
      }
    }

    // DELETE previous schedule : if any
    const previousSchedules = await db.collection("schedule").where("email", "==", email.toLowerCase()).get();
    for (let scheduleDoc of previousSchedules.docs) {
      const scheduleData = scheduleDoc.data();
      if (scheduleData?.id) {
        await deleteEvent(scheduleData.id);
        const scheduleRef = db.collection("schedule").doc(scheduleDoc.id);
        batch.delete(scheduleRef);
      }
    }

    const researchersBySession = {};

    for (let i = 0; i < sessions.length; ++i) {
      const start = moment(sessions[i]).utcOffset(-4, true).toDate().toLocaleString();
      let availableResearchers = availSessions[start] || [];
      const sessionDuration = projectSpecsData.sessionDuration?.[i] || 2; //[2,1,1]
      for (let j = 0; j < sessionDuration; j++) {
        const availableSlot = moment(sessions[i])
          .add((j * 60) / projectSpecsData.hourlyChunks, "minutes")
          .utcOffset(-4, true)
          .toDate()
          .toLocaleString();
        availableResearchers = availableResearchers.filter(availableResearcher =>
          (availSessions[availableSlot] || []).includes(availableResearcher)
        );
      }
      researchersBySession[start] = availableResearchers;
    }

    const selectedResearchers = {};

    for (const session in researchersBySession) {
      const availableResearchers = researchersBySession[session];
      const researcher = availableResearchers[Math.floor(Math.random() * availableResearchers.length)];

      if (!researcher) {
        throw new Error("No researcher is available in given schedule");
      }

      selectedResearchers[session] = researcher;
    }
    for (let i = 0; i < sessions.length; ++i) {
      const sessionDate = moment(sessions[i]).utcOffset(-4, true).toDate().toLocaleString();
      const researcher = selectedResearchers[sessionDate];
      const rUser = await db.collection("users").doc(researcher).get();
      const rUserData = rUser.data();

      const start = moment(sessions[i]).utcOffset(-4, true);
      const sessionDuration = projectSpecsData.sessionDuration?.[i] || 2;
      // adding slotDuration * number of slots for the session
      const end = moment(start).add(slotDuration * sessionDuration, "minutes");
      // const eventCreated = await insertEvent(start, end, summary, description, [{ email }, { email: researcher }], colorId);
      const eventCreated = await createExperimentEvent(
        email,
        rUserData.email,
        toOrdinal(i + 1),
        start,
        end,
        projectSpecsData,
        surveyType
      );
      events.push(eventCreated);

      const scheduleRef = db.collection("schedule").doc();
      batch.set(scheduleRef, {
        email: email.toLowerCase(),
        session: Timestamp.fromDate(start.toDate()),
        order: toOrdinal(i + 1),
        id: eventCreated.data.id,
        project
      });
    }
    if (project === "OnlineCommunities") {
      const instructorsDocs = await db.collection("instructors").where("email", "==", email).get();
      let instructorId = "";
      if (instructorsDocs.docs.length === 0) {
        const newInstructor = {
          website: "",
          prefix: "Prof",
          firstname,
          lastname,
          email,
          country: "🇺🇸 United States;US",
          stateInfo: "",
          city: "",
          institution,
          scraped: true,
          createdAt: new Date(),
          interestedTopic: "",
          project: "H1L2",
          fullname: "Iman YeckehZaare",
          no: false,
          yes: false,
          deleted: false,
          scheduled: true,
          reminders: 0
        };
        const instructorRef = db.collection("instructors").doc();
        batch.set(instructorRef, newInstructor);
        instructorId = instructorRef.id;
      } else {
        instructorId = instructorsDocs.docs[0].id;
        batch.update(instructorsDocs.docs[0].ref, {
          scheduled: true
        });
      }
      const fullName = await getAvailableFullname(`${firstname} ${lastname}`);
      const userSurevyRef = db.collection("usersSurvey").doc(fullName);
      batch.set(userSurevyRef, {
        email: email,
        project,
        scheduled: true,
        institution,
        instructorId,
        firstname,
        uid: "",
        surveyType: "instructor",
        lastname,
        noRetaineData: false,
        createdAt: Timestamp.fromDate(new Date())
      });
      const usersServeyDocs = await db.collection("usersSurvey").where("email", "==", email).get();
      if (usersServeyDocs.docs.length === 0) {
        const fullName = await getAvailableFullname(`${firstname} ${lastname}`);
        const userSurevyRef = db.collection("usersSurvey").doc(fullName);
        batch.set(userSurevyRef, {
          email,
          project,
          scheduled: true,
          institution,
          instructorId,
          firstname,
          uid: "",
          surveyType: "instructor",
          lastname,
          noRetaineData: false,
          createdAt: Timestamp.fromDate(new Date())
        });
      }
    }
    // const onecademyDocs = await knowledgeDb.collection("users").where("email", "==", email).get();
    // if (onecademyDocs.docs.length === 0) {
    const randomNum = Math.floor(Math.random() * 10);
    const newUserOneCademy = {
      uname: firstname.trim() + lastname.trim() + randomNum,
      email,
      fName: firstname,
      lName: lastname,
      password: "onecademy",
      lang: "English",
      country: "",
      state: "",
      city: "",
      gender: null,
      birthDate: null,
      foundFrom: "Instructor invitation",
      education: null,
      occupation: "",
      ethnicity: [],
      reason: "",
      chooseUname: false,
      clickedConsent: false,
      clickedTOS: false,
      clickedPP: false,
      clickedCP: false,
      clickedGDPR: false,
      tag: "1Cademy",
      tagId: "r98BjyFDCe4YyLA3U8ZE",
      deMajor: null,
      deInstit: institution,
      theme: "Dark",
      background: "Image",
      consented: true,
      GDPRPolicyAgreement: true,
      termsOfServiceAgreement: true,
      privacyPolicyAgreement: true,
      cookiesAgreement: true,
      fieldOfInterest: "",
      course: null,
      invitedInstructor: "6L2gj2fvh4ciLnMfqzjD"
    };
    try {
      await axios.post("https://1cademy.com/api/signup", { data: newUserOneCademy });
    } catch {
      console.log("user already exists");
    }
    // }

    await batch.commit();
    return res.status(200).json({ message: "Sessions successfully scheduled" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error occurred, please try later" });
  }
};
