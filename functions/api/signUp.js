const { db, admin } = require("../admin");
const { getAuth } = require("firebase-admin/auth");
const { Timestamp } = require("firebase-admin/firestore");
const { shuffleArray } = require("../helpers");
const { getAvailableFullname, deletePreviousUserEmails } = require("../helpers/common");

module.exports = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      institutionName,
      projectName,
      surveyType,
      instructorId,
      noRetaineData
    } = req.body;

    const batch = db.batch();

    const fullName = await getAvailableFullname(`${firstName} ${lastName}`);

    let collectionName = "users";
    if (surveyType === "student" || surveyType === "instructor") {
      collectionName = "usersSurvey";
    }

    const auth = getAuth(admin);
    try {
      const previousUser = await auth.getUserByEmail(email);
      if (previousUser) {
        return res.status(500).json({
          message: "Email already exists."
        });
      }
    } catch (error) {}

    const user = await auth.createUser({
      email,
      password,
      displayName: fullName
    });

    let userData = {
      uid: user.uid,
      email,
      firstname: firstName,
      lastname: lastName,
      project: projectName,
      institution: institutionName
    };

    if (!surveyType) {
      await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        participant: true
      });

      const minPConditions = [];
      const assigned = {};

      const projectSpecsDoc = await db.collection("projectSpecs").doc(projectName).get();
      const projectSpecs = projectSpecsDoc.data();
      const conditions = shuffleArray([...projectSpecs.conditions]);

      const passages = await db.collection("passages").where("projectIds", "array-contains", projectName).get();
      // passages that contains the current project
      let passagesDocs = passages.docs.filter(p => projectName in p.data()?.projects);

      conditions.forEach(con => {
        // sort the passages in ascending order according to the current pcondition
        const sortedPassages = [...passagesDocs].sort((a, b) => {
          return (a.data().projects?.[projectName]?.[con] || 0) - (b.data().projects?.[projectName]?.[con] || 0);
        });
        for (let p of sortedPassages) {
          if (!assigned[p.id]) {
            minPConditions.push({ condition: con, passage: p.id });
            assigned[p.id] = true;
            break;
          }
        }
      });

      // setting up a null passage that is not in minPConditions.
      let nullPassage = "";
      let passIdx = Math.floor(Math.random() * passagesDocs.length);
      while (
        minPConditions.some(
          // eslint-disable-next-line no-loop-func
          pCon => pCon.passage === passagesDocs[passIdx].id
        )
      ) {
        passIdx = Math.floor(Math.random() * passagesDocs.length);
      }
      nullPassage = passagesDocs[passIdx]?.id || "";
      for (let { condition } of minPConditions) {
        // eslint-disable-next-line no-loop-func
        await db.runTransaction(async t => {
          const conditionRef = db.collection("conditions").doc(condition);
          const conditionDoc = await t.get(conditionRef);
          if (conditionDoc.exists) {
            const conditionData = conditionDoc.data();
            t.update(conditionRef, {
              [projectName]: (conditionData[projectName] || 0) + 1
            });
          } else {
            t.set(conditionRef, { [projectName]: 1 });
          }
        });
      }

      const initChoices = new Array(10).fill("");
      userData = {
        ...userData,
        phase: 0,
        step: 1,
        pConditions: minPConditions,
        currentPCon: minPConditions[0] || "",
        nullPassage,
        choices: initChoices,
        createdAt: new Date()
      };
    } else {
      userData = {
        ...userData,
        surveyType,
        noRetaineData,
        instructorId
      };
      await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        survey: true
      });
    }

    const userRef = db.collection(collectionName).doc(fullName);
    await deletePreviousUserEmails(email, collectionName);
    batch.set(userRef, userData);

    const userLogRef = db.collection("userLogs").doc();
    batch.set(userLogRef, {
      updatedAt: Timestamp.fromDate(new Date()),
      id: userRef.id,
      ...userData
    });

    await batch.commit();

    return res.status(201).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e.message
    });
  }
};
