const { db, admin } = require("../admin");
const { getAuth } = require('firebase-admin/auth');
const { Timestamp } = require("firebase-admin/firestore");
const { shuffleArray } = require("../helpers");

const getAvailableFullname = async (fullname) => {
  const userCollections = ["users", "usersStudentCoNoteSurvey", "usersInstructorCoNoteSurvey"];

  let _fullname = fullname;
  while(true) {
    let found = false;

    for(const userCollection of userCollections) {
      const docRef = await db.collection(userCollection).doc(_fullname).get();
      if(docRef.exists) {
        found = true;
      }
    }

    if(!found) {
      break;
    }

    _fullname += " ";
  }

  return _fullname;
}

module.exports = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      institutionName,
      projectName,
      surveyType
    } = req.body;

    const batch = db.batch();
  
    const fullName = await getAvailableFullname(`${firstName} ${lastName}`);
  
    let collectionName = "users";
    if(surveyType === "student") {
      collectionName = "usersStudentCoNoteSurvey";
    } else if(surveyType === "instructor") {
      collectionName = "usersInstructorCoNoteSurvey";
    }
    
    const auth = getAuth(admin);

    try {
      await auth.getUserByEmail(email);
      return res.status(500).json({
        message: "Email already exists."
      });
    } catch(e) {}

    const user = await auth.createUser({
      email,
      password,
      displayName: fullName
    })
  
    let userData = {
      uid: user.uid,
      email,
      firstname: firstName,
      lastname: lastName,
      project: projectName,
      institution: institutionName
    };
    
    if(!surveyType) {
      await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        participant: true
      })

      const minPConditions = [];
      const assigned = {};
  
      const projectSpecsDoc = await db.collection("projectSpecs").doc(projectName).get();
      const projectSpecs = projectSpecsDoc.data();
      const conditions = shuffleArray([...projectSpecs.conditions]);

      const passages = await db.collection("passages").get();
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
      let questions;
      for (let { condition, passage } of minPConditions) {
        // eslint-disable-next-line no-loop-func
        await db.runTransaction(async t => {
          const conditionRef = db.collection("conditions").doc(condition);
          const conditionDoc = await t.get(conditionRef);
          const passageRef = db.collection("passages").doc(passage);
          const passageDoc = await t.get(passageRef);
          const passageData = passageDoc.data();
  
          if (conditionDoc.exists) {
            const conditionData = conditionDoc.data();
            t.update(conditionRef, {
              [projectName]: (conditionData[projectName] || 0) + 1
            });
          } else {
            t.set(conditionRef, { [projectName]: 1 });
          }
  
          if (!questions) {
            questions = passageData.questions;
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
      }
    } else if(surveyType === "student") {
      await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        studentSurvey: true
      })
    } else if(surveyType === "instructor") {
      await auth.setCustomUserClaims(user.uid, {
        ...user.customClaims,
        instructorSurvey: true
      })
    }
  
    const userRef = db.collection(collectionName).doc(fullName);
    batch.set(userRef, userData);

    const userLogRef = db.collection("userLogs").doc();
    batch.set(userLogRef, {
      updatedAt: Timestamp.fromDate(new Date()),
      id: userRef.id,
      ...userData
    })

    await batch.commit();

    return res.status(201).json({ success: true });
  } catch(e) {
    console.log(e)
    return res.status(500).json({
      message: e.message
    })
  }
}