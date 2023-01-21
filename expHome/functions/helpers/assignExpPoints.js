const { db } = require("../admin");
const moment = require("moment-timezone");
const { Timestamp } = require("firebase-admin/firestore");
const { getEvent } = require("../GoogleCalendar");

exports.assignExpPoints = async (researcher, participant, session, project, checkRecallsAndFeedback = true, eventId) => {
  // TODO: need to write its tests
  // TODO: change logic for searching expSession in future when most of documents would have eventId

  const batch = db.batch();

  const researcherRef = db.collection("researchers").doc(researcher);
  const researcherDoc = await researcherRef.get();
  // if researcher document not exists
  if(!researcherDoc.exists) {
    return;
  }
  const researcherData = researcherDoc.data();

  let scheduleData = {};

  if(checkRecallsAndFeedback) {

    const user = await db.collection("users").doc(participant).get();
    // if user document not exists
    if(!user.exists) {
      return;
    }

    const schedules = await db.collection("schedule")
    .where("email", "==", user.data()?.email || "")
    .where("order", "==", session).get();

    // schedule is not available
    if(!schedules.docs.length) return;

    const schedule = schedules.docs[0];
    scheduleData = schedule.data();
  }

  // if google calender event does not exists
  if(!scheduleData?.id && checkRecallsAndFeedback) return;

  const _eventId = checkRecallsAndFeedback ? scheduleData?.id : eventId;

  const event = await getEvent(_eventId);
  const attendees = (event.attendees || []).map((attendee) => attendee.email);

  const startTime = moment.tz(event.start.dateTime, event.start.timeZone).toDate();
  const endTime = moment.tz(event.end.dateTime, event.end.timeZone).toDate();

  const expSessions = await db.collection("expSessions")
    .where("attendees", "==", attendees)
    .where("sTime", "==", Timestamp.fromDate(startTime))
    .where("project", "==", project).get();

  // if points already distributed for this session we are not going to run this logic
  if(expSessions.docs.length) {
    return;
  }

  // checking if researcher attended session
  if(!attendees.includes(researcherData.email)) return;

  let points = session === "1st" ? 16 : 10;

  // this is temporary until the survey is over.
  // as this survey will have only one session
  if (project === "Annotating") {
    points = 10;
  }

  if(checkRecallsAndFeedback) {
    let ready = true;

    const userRecallGrades = await db
    .collection("recallGradesV2")
    .where("user", "==", participant)
    .where("project", "==", project)
    .get();
    const userfeedbacks = await db
      .collection("feedbackCode")
      .where("fullname", "==", participant)
      .where("project", "==", project)
      .where("session", "==", session)
      .get();

    const userRecallGradeData = userRecallGrades.docs[0].data();
    const recallGradeRef = db.collection("recallGradesV2").doc(userRecallGrades.docs[0].id);

    // if grading already done for this session
    const pointGradings = userRecallGradeData.pointGradings || [];
    if(pointGradings.includes(session)) {
      return;
    }
    pointGradings.push(session);

    const reacallSession = userRecallGradeData.sessions[session];

    for (let recall of reacallSession) {
      if (!recall.researchers.includes(researcher)) {
        ready = false;
        break;
      }
    }
    // if researcher haven't graded recalls then we don't need to check the feedbackcode collection
    if (!ready) return;
  
    for (let feedback of userfeedbacks.docs) {
      const feedbackData = feedback.data();
      if (!feedbackData.coders.includes(researcher)) {
        ready = false;
        break;
      }
    }
    if (!ready) return;
    // if researcher haven't coded the feedback, we shouldn't give them points

    batch.update(recallGradeRef, {
      pointGradings
    })
  }
  
  let researcherExpPoints = 0;
  if (researcherData.projects[project]?.expPoints) {
    researcherExpPoints = researcherData.projects[project].expPoints;
  }
  const researcherProjectUpdates = {
    projects: {
      ...researcherData.projects,
      [project]: {
        ...researcherData.projects[project],
        expPoints: researcherExpPoints + points
      }
    }
  };
  researcherRef.update(researcherProjectUpdates);

  // creating exp Sessions for listing point history to researcher later
  const expSessionRef = db.collection("expSessions").doc();
  batch.set(expSessionRef, {
    attendees,
    createdAt: new Date(),
    eTime: endTime,
    sTime: startTime,
    project,
    points,
    user: participant,
    researcher,
    session,
    eventId: _eventId
  })

  // creating researcher log
  const researcherLogRef = db.collection("researcherLogs").doc();
  batch.set(researcherLogRef, {
    ...researcherProjectUpdates,
    id: researcherRef.id,
    updatedAt: new Date()
  });

  batch.update(researcherRef, researcherProjectUpdates);

  await batch.commit();
};
