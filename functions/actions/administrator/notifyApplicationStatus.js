const { db } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const appls = [];
    let registered = 0;
    let completedFirst = 0;
    let completedSecond = 0;
    let completedThird = 0;
    let recallFirst = 0;
    let recallSecond = 0;
    let recallThird = 0;
    let recallFirstRatio = 0;
    let recallSecondRatio = 0;
    let recallThirdRatio = 0;
    const applicationsHash = {};

    const applicationsDocs = await db.collection("applications").get();
    applicationsDocs.forEach(doc => {
      const application = doc.data();
      if (applicationsHash.hasOwnProperty(application.fullname)) {
        applicationsHash[application.fullname].push(application);
      } else {
        applicationsHash[application.fullname] = [application];
      }
    });

    const tutorialHash = {};
    const tutorialsDocs = await db.collection("tutorial").get();
    tutorialsDocs.forEach(doc => {
      const tutorial = doc.data();
      tutorialHash[doc.id] = tutorial;
    });

    const userDocs = await db.collection("users").get();
    const surveyInstructors = await db.collection("instructors").get();
    const surveyUsers = await db.collection("usersSurvey").get();
    for (let userDoc of [...surveyInstructors.docs, ...surveyUsers.docs, ...userDocs.docs]) {
      const userData = userDoc.data();
      if ("createdAt" in userData && userData.createdAt.toDate() > new Date("1-14-2022")) {
        registered += 1;
        if ("postQ2Choice" in userData) {
          completedFirst += 1;
          if ("pConditions" in userData && userData.pConditions.length === 2) {
            recallFirst += userData.pConditions[0].recallScore + userData.pConditions[1].recallScore;
            recallFirstRatio += userData.pConditions[0].recallScoreRatio + userData.pConditions[1].recallScoreRatio;
          }
        }
        if ("post3DaysQ2Choice" in userData) {
          completedSecond += 1;
          if ("pConditions" in userData && userData.pConditions.length === 2) {
            recallSecond += userData.pConditions[0].recall3DaysScore + userData.pConditions[1].recall3DaysScore;
            recallSecondRatio +=
              userData.pConditions[0].recall3DaysScoreRatio + userData.pConditions[1].recall3DaysScoreRatio;
          }
        }
        if ("projectDone" in userData && userData.projectDone) {
          completedThird += 1;
          if ("pConditions" in userData && userData.pConditions.length === 2) {
            recallThird += userData.pConditions[0].recall1WeekScore
              ? userData.pConditions[0].recall1WeekScore
              : 0 + userData.pConditions[1].recall1WeekScore
              ? userData.pConditions[1].recall1WeekScore
              : 0;
            recallThirdRatio +=
              userData.pConditions[0].recall1WeekScoreRatio + userData.pConditions[1].recall1WeekScoreRatio;
          }
          const appl = {
            id: userDoc.id,
            createdAt: userData.createdAt.toDate(),
            user: userDoc.id,
            email: userData.email,
            tutStarted: false,
            tutorial: false,
            applicationsStarted: [],
            applications: [],
            withdrew: "withdrew" in userData && userData.withdrew,
            withdrawExp: "withdrawExp" in userData && userData.withdrawExp,
            reminder: "reminder" in userData && userData.reminder ? userData.reminder.toDate() : null
          };
          if (tutorialHash.hasOwnProperty(userDoc.id)) {
            appl.tutStarted = true;
            const tutorialData = tutorialHash[userDoc.id];
            if ("ended" in tutorialData && tutorialData.ended) {
              appl.tutorial = true;
              const applicationDocs = applicationsHash[userDoc.id] || [];
              for (let applicationData of applicationDocs) {
                appl.applicationsStarted.push(applicationData.communiId);
                if ("ended" in applicationData && applicationData.ended) {
                  appl.applications.push(
                    applicationData.communiId + ": " + applicationData.corrects + " - " + applicationData.wrongs
                  );
                }
              }
            }
          }
          appls.push(appl);
        }
      }
    }
    res.status(200).send({
      registered,
      completedFirst,
      completedSecond,
      completedThird,
      recallFirst,
      recallSecond,
      recallThird,
      recallFirstRatio,
      recallSecondRatio,
      recallThirdRatio,
      applications: appls
    });
  } catch (error) {
    res.status(200).send({ message: "error", data: error });
    console.log(error);
  }
};
