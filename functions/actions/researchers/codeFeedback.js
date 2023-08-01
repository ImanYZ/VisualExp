const { db } = require("../../admin");
const { assignExpPoints } = require("../../helpers/assignExpPoints");
const { Timestamp } = require("firebase-admin/firestore");

module.exports = async (req, res) => {
  try {
    const { docId, quotesSelectedForCodes, choiceConditions, approvedCodes, project } = req.body;

    const { docId: fullname } = req.researcher;

    const { researcher } = req;

    console.log({researcher});

    if (!quotesSelectedForCodes || !choiceConditions || !project) {
      return res.status(500).send({
        message: "some parameters are missing"
      });
    }
    await db.runTransaction(async t => {
      let recievePositivePoints = [];
      let recieveNegativePoints = [];
      let transactionWrites = [];

      const feedbackCodeRef = db.collection("feedbackCode").doc(docId);
      const feedbackCodeDoc = await t.get(feedbackCodeRef);
      const feedbackCodeData = feedbackCodeDoc.data();
      let codesVotes = {};

      const researchers = await t.get(db.collection("researchers"));
      let researchersUpdates = {};
      let updatedResearchers = [];
      for (const _researcher of researchers.docs) {
        const researcherData = _researcher.data();
        researchersUpdates[_researcher.id] = researcherData;
      }
      researchersUpdates[researcher.docId].projects = researcher.projects;
      updatedResearchers.push(researcher.docId);

      approvedCodes.forEach(codeData => {
        if (quotesSelectedForCodes[codeData.code] && quotesSelectedForCodes[codeData.code].length !== 0) {
          if (feedbackCodeData.codesVotes[codeData.code]) {
            if (!feedbackCodeData.codesVotes[codeData.code].includes(fullname)) {
              const voters = feedbackCodeData.codesVotes[codeData.code];
              voters.push(fullname);
              codesVotes[codeData.code] = voters;
            }
          } else {
            codesVotes[codeData.code] = [fullname];
          }
        } else {
          if (feedbackCodeData.codesVotes[codeData.code]) {
            if (feedbackCodeData.codesVotes[codeData.code].includes(fullname)) {
              const voters = feedbackCodeData.codesVotes[codeData.code];
              voters.splice(voters.indexOf(fullname), 1);
              codesVotes[codeData.code] = voters;
            }
          } else {
            codesVotes[codeData.code] = [];
          }
        }
      });
      let feedbackCodeUpdate = {
        codersChoices: {
          ...feedbackCodeData.codersChoices,
          [fullname]: quotesSelectedForCodes
        },
        codersChoiceConditions: {
          ...feedbackCodeData.codersChoiceConditions,
          [fullname]: choiceConditions
        },
        coders: feedbackCodeData.coders.includes(fullname)
          ? feedbackCodeData.coders
          : [...feedbackCodeData.coders, fullname],
        codesVotes,
        updatedAt: new Date()
      };
      if (feedbackCodeUpdate.coders.length === 3) {
        feedbackCodeUpdate.approved = true;
        for (let code in feedbackCodeUpdate.codesVotes) {
          if (feedbackCodeUpdate.codesVotes[code].length >= 2) {
            for (let _researcher of feedbackCodeUpdate.codesVotes[code]) {
              recievePositivePoints.push(_researcher);
            }
            if (feedbackCodeUpdate.codesVotes[code].length === 2) {
              for (let otherCoder of feedbackCodeUpdate.coders) {
                if (!feedbackCodeUpdate.codesVotes[code].includes(otherCoder)) {
                  recieveNegativePoints.push(otherCoder);
                }
              }
            }
          } else if (feedbackCodeUpdate.codesVotes[code].length === 1) {
            const theCoder = feedbackCodeUpdate.codesVotes[code][0];
            recieveNegativePoints.push(theCoder);
            for (let otherCoder of feedbackCodeUpdate.coders) {
              if (otherCoder !== theCoder) {
                recievePositivePoints.push(otherCoder);
              }
            }
          } else if (feedbackCodeUpdate.codesVotes[code].length === 0) {
            for (let otherCoder of feedbackCodeUpdate.coders) {
              recievePositivePoints.push(otherCoder);
            }
          }
        }
        for (let _researcher of feedbackCodeUpdate.coders) {
          let negativeCodingPoints = 0;
          let positiveCodingPoints = 0;
          recievePositivePoints.forEach(coder => {
            if (coder === _researcher) {
              positiveCodingPoints += 0.04;
            }
          });
          recieveNegativePoints.forEach(coder => {
            if (coder === _researcher) {
              negativeCodingPoints += 0.04;
            }
          });

          positiveCodingPoints = Number(Number.parseFloat(positiveCodingPoints).toFixed(2));
          negativeCodingPoints = Number(Number.parseFloat(negativeCodingPoints).toFixed(2));

          // const researcherUpdates = {
          //   projects: {
          //     ...researcherData.projects,
          //     [project]: {
          //       ...researcherData.projects[project]
          //     }
          //   }
          // };

          let calulatedProject = project;
          if (!(project in researchersUpdates[_researcher].projects)) {
            calulatedProject = Object.keys(researchersUpdates[_researcher].projects)[0];
          }
          if (researchersUpdates[_researcher].projects[calulatedProject]) {
            if ("negativeCodingPoints" in researchersUpdates[_researcher].projects[calulatedProject]) {
              researchersUpdates[_researcher].projects[calulatedProject].negativeCodingPoints += negativeCodingPoints;
            } else {
              researchersUpdates[_researcher].projects[calulatedProject].negativeCodingPoints = negativeCodingPoints;
            }
            if ("positiveCodingPoints" in researchersUpdates[_researcher].projects[calulatedProject]) {
              researchersUpdates[_researcher].projects[calulatedProject].positiveCodingPoints += positiveCodingPoints;
            } else {
              researchersUpdates[_researcher].projects[calulatedProject].positiveCodingPoints = positiveCodingPoints;
            }
          }
          updatedResearchers.push(_researcher);
        }
      }

      if ("codingNum" in researchersUpdates[fullname].projects[project]) {
        researchersUpdates[fullname].projects[project].codingNum += 1;
      } else {
        researchersUpdates[fullname].projects[project].codingNum = 1;
      }

      transactionWrites.push({
        type: "update",
        refObj: feedbackCodeRef,
        updateObj: feedbackCodeUpdate
      });

      const recallGradeLogRef = db.collection("feedbackCodeLogs").doc();
      transactionWrites.push({
        type: "set",
        refObj: recallGradeLogRef,
        updateObj: {
          createdAt: Timestamp.fromDate(new Date()),
          researcher: fullname,
          points: 1,
          project
        }
      });
      const { fullname: participant, project: _project, session } = feedbackCodeData;
      // to assign points to researcher for session if feedback coding and recall grading is done

      await assignExpPoints({
        researcher,
        participant,
        session,
        project: _project,
        recallGradeData: null,
        feedbackCodeData: { id: feedbackCodeRef.id, ...feedbackCodeUpdate },
        transactionWrites,
        researchersUpdates,
        t
      });

      for (const researcherId in researchersUpdates) {
        if (!updatedResearchers.includes(researcherId)) {
          continue;
        }
        const researcherRef = db.collection("researchers").doc(researcherId);
        transactionWrites.push({
          type: "update",
          refObj: researcherRef,
          updateObj: researchersUpdates[researcherId]
        });
      }
      for (const transactionWrite of transactionWrites) {
        if (transactionWrite.type === "update") {
          t.update(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "set") {
          t.set(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "delete") {
          t.delete(transactionWrite.refObj);
        }
      }
    });

    return res
      .status(200)
      .json({ success: true, endpoint: "FeedBack upload", successData: req.body.quotesSelectedForCodes });
  } catch (err) {
    console.error({ err });
    return res.status(500).json({ errMsg: err.message, success: false });
  }
};
