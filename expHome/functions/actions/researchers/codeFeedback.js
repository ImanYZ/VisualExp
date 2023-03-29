const { db } = require("../../admin");
const { assignExpPoints } = require("../../helpers/assignExpPoints");

module.exports = async (req, res) => {
  try {
    const { fullname, docId, quotesSelectedForCodes, choiceConditions, approvedCodes, project } = req.body;
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
      const feedbackCodeOrders = await t.get(
        db.collection("feedbackCodeOrderV2").where("project", "==", project).where("researcher", "==", fullname)
      );
      const feedbackOrderRef = db.collection("feedbackCodeOrderV2").doc(feedbackCodeOrders.docs[0].id);

      const feedOrderData = feedbackCodeOrders.docs[0].data();
      feedOrderData.codeIds.splice(feedOrderData.codeIds.indexOf(docId), 1);
      const feedbackCodeDoc = await t.get(feedbackCodeRef);
      const feedbackCodeData = feedbackCodeDoc.data();
      let codesVotes = {};

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
            for (let researcher of feedbackCodeUpdate.codesVotes[code]) {
              recievePositivePoints.push(researcher);
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
        for (let res of feedbackCodeUpdate.coders) {
          const researcherRef = db.collection("researchers").doc(res);

          const researcherData = (await t.get(researcherRef)).data();
          let negativeCodingPoints = 0;
          let positiveCodingPoints = 0;
          recievePositivePoints.forEach(coder => {
            if (coder === res) {
              positiveCodingPoints += 0.04;
            }
          });
          recieveNegativePoints.forEach(coder => {
            if (coder === res) {
              negativeCodingPoints += 0.04;
            }
          });

          positiveCodingPoints = Number(Number.parseFloat(positiveCodingPoints).toFixed(2));
          negativeCodingPoints = Number(Number.parseFloat(negativeCodingPoints).toFixed(2));

          const researcherUpdates = {
            projects: {
              ...researcherData.projects,
              [project]: {
                ...researcherData.projects[project]
              }
            }
          };

          let calulatedProject = project;
          if (!(project in researcherData.projects)) {
            calulatedProject = Object.keys(researcherData.projects)[0];
          }
          if (researcherUpdates.projects[calulatedProject]) {
            if ("negativeCodingPoints" in researcherUpdates.projects[calulatedProject]) {
              researcherUpdates.projects[calulatedProject].negativeCodingPoints += negativeCodingPoints;
            } else {
              researcherUpdates.projects[calulatedProject].negativeCodingPoints = negativeCodingPoints;
            }
            if ("positiveCodingPoints" in researcherUpdates.projects[calulatedProject]) {
              researcherUpdates.projects[calulatedProject].positiveCodingPoints += positiveCodingPoints;
            } else {
              researcherUpdates.projects[calulatedProject].positiveCodingPoints = positiveCodingPoints;
            }
            transactionWrites.push({
              type: "update",
              refObj: researcherRef,
              updateObj: researcherUpdates
            });
          }
        }
      }

      transactionWrites.push({
        type: "update",
        refObj: feedbackCodeRef,
        updateObj: feedbackCodeUpdate
      });

      transactionWrites.push({
        type: "update",
        refObj: feedbackOrderRef,
        updateObj: feedOrderData
      });
      const { fullname: participant, project: _project, session } = feedbackCodeData;
      // to assign points to researcher for session if feedback coding and recall grading is done

      await assignExpPoints({
        researcher: fullname,
        participant,
        session,
        project: _project,
        recallGradeData: null,
        feedbackCodeData: { id: feedbackCodeRef.id, ...feedbackCodeUpdate },
        transactionWrites,
        t
      });

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
