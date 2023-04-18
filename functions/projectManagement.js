const { admin, db, commitBatch, batchUpdate } = require("./admin");
const {futureEvents, pastEvents } = require("./scheduling");
const { isToday } = require("./utils");
const { delay } = require("./helpers/common");
const {
  reschEventNotificationEmail,
  researcherEventNotificationEmail,
  eventNotificationEmail,
  notAttendedEmail,
  remindResearcherToSpecifyAvailability
} = require("./emailing");
const { deleteEvent } = require("./GoogleCalendar");
const moment = require("moment");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");


const voteFn = async (voter, activity, vote) => {
  try {
    const currentTime = Timestamp.fromDate(new Date());
    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const activityRef = db.collection("activities").doc(activity);
      const activityDoc = await t.get(activityRef);
      if (activityDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const activityData = activityDoc.data();
        const researcherRef = db.collection("researchers").doc(activityData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("votes")
          .where("activity", "==", activity)
          .where("voter", "==", voter)
          .where("project", "==", activityData.project)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let noVote = false;
        let newUpVote = vote === "upVote";
        let newNoVote = vote === "noVote";
        let voteRef, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("votes").doc(voteDocs.docs[0].id);
          const voteData = voteDocs.docs[0].data();
          ({ upVote, noVote } = voteData);
          if (newUpVote) {
            newUpVote = !upVote;
            newNoVote = false;
          } else if (newNoVote) {
            newUpVote = false;
            newNoVote = !noVote;
          }
          newVoteData = {
            upVote: newUpVote,
            noVote: newNoVote,
            updatedAt: currentTime
          };
          t.update(voteRef, newVoteData);
        } else {
          voteRef = db.collection("votes").doc();
          newVoteData = {
            fullname: activityData.fullname,
            activity,
            project: activityData.project,
            upVote: newUpVote,
            noVote: newNoVote,
            voter,
            createdAt: currentTime
          };
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("voteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id
        });
        let upVoteVal = 0;
        let noVoteVal = 0;
        if (vote === "upVote") {
          upVoteVal = upVote ? -1 : 1;
          noVoteVal = noVote ? -1 : 0;
        } else if (vote === "noVote") {
          upVoteVal = upVote ? -1 : 0;
          noVoteVal = noVote ? -1 : 1;
        }
        let upVotes = 0;
        if (voterData.projects[activityData.project].upVotes) {
          upVotes = voterData.projects[activityData.project].upVotes;
        }
        let noVotes = 0;
        if (voterData.projects[activityData.project].noVotes) {
          noVotes = voterData.projects[activityData.project].noVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [activityData.project]: {
              ...voterData.projects[activityData.project],
              upVotes: upVotes + upVoteVal,
              noVotes: noVotes + noVoteVal
            }
          }
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id
        });
        let points = 0;
        if (researcherData.projects[activityData.project].points) {
          points = researcherData.projects[activityData.project].points;
        }
        const researcherProjectUpdates = {
          projects: {
            ...researcherData.projects,
            [activityData.project]: {
              ...researcherData.projects[activityData.project],
              points: points + upVoteVal
            }
          }
        };
        t.update(researcherRef, researcherProjectUpdates);
        const researcherLogRef = db.collection("researcherLogs").doc();
        t.set(researcherLogRef, {
          ...researcherProjectUpdates,
          updatedAt: currentTime,
          id: researcherRef.id
        });
        let activityUpVotes = 0;
        if (activityData.upVotes) {
          activityUpVotes = activityData.upVotes;
        }
        let activityNoVotes = 0;
        if (activityData.noVotes) {
          activityNoVotes = activityData.noVotes;
        }
        const activityUpdates = {
          upVotes: activityUpVotes + upVoteVal,
          noVotes: activityNoVotes + noVoteVal
        };
        t.update(activityRef, activityUpdates);
        const activityLogRef = db.collection("activityLogs").doc();
        t.set(activityLogRef, {
          id: activityRef.id,
          updatedAt: currentTime,
          ...activityUpdates
        });
      }
    });
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};

exports.voteEndpoint = async (req, res) => {
  try {
    const activity = req.body.activity;
    const vote = req.body.vote;
    if (activity && vote) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteFn(userDocs.docs[0].id, activity, vote);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteActivityReset = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const currentTime = Timestamp.fromDate(new Date());
        await db.runTransaction(async t => {
          const activityRef = db.collection("activities").doc(activity);
          const activityDoc = await t.get(activityRef);
          if (activityDoc.exists) {
            const voteQuery = db.collection("votes").where("activity", "==", activity);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("votes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                noVote: false,
                updatedAt: currentTime
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("voteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id
              });
            }
            const activityUpdates = {
              upVotes: 0,
              noVotes: 0
            };
            t.update(activityRef, activityUpdates);
            const activityLogRef = db.collection("activityLogs").doc();
            t.set(activityLogRef, {
              id: activityRef.id,
              updatedAt: currentTime,
              ...activityUpdates
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.markPaidEndpoint = async (req, res) => {
  try {
    const activities = req.body.activities;
    if (activities) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const researcherDoc = await db.collection("researchers").doc(userDocs.docs[0].id).get();
        if (researcherDoc.exists) {
          const researcherData = researcherDoc.data();
          if (researcherData.isAdmin) {
            for (let acti of activities) {
              const activityRef = db.collection("activities").doc(acti.id);
              await batchUpdate(activityRef, { paid: true });
            }
            await commitBatch();
          }
        }
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      try {
        await db.runTransaction(async t => {
          const userQuery = db.collection("users").where("uid", "==", authUser.uid).limit(1);
          const userDocs = await t.get(userQuery);
          if (userDocs.docs.length > 0) {
            const fullname = userDocs.docs[0].id;
            const researcherRef = db.collection("researchers").doc(fullname);
            const researcherDoc = await t.get(researcherRef);
            const researcherData = researcherDoc.data();
            const activityRef = db.collection("activities").doc(activity);
            const activityDoc = await t.get(activityRef);
            const activityData = activityDoc.data();
            if (activityData.fullname === fullname) {
              const votesQuery = db.collection("votes").where("activity", "==", activity);
              const voteDocs = await t.get(votesQuery);
              const voteRefsToDelete = [];
              const voterUpdates = [];
              for (const voteDoc of voteDocs.docs) {
                const voteRef = db.collection("votes").doc(voteDoc.id);
                voteRefsToDelete.push(voteRef);
                const voteData = voteDoc.data();
                const voterRef = db.collection("researchers").doc(voteData.voter);
                const voterDoc = await t.get(voterRef);
                const voterData = voterDoc.data();
                const voterUpdateData = {
                  projects: voterData.projects
                };
                if (voteData.upVote) {
                  voterUpdateData.projects[voteData.project].upVotes -= 1;
                } else if (voteData.noVote) {
                  voterUpdateData.projects[voteData.project].noVotes -= 1;
                }
                voterUpdates.push({
                  voterRef,
                  voterUpdateData
                });
              }
              for (let voteRefToDelete of voteRefsToDelete) {
                const voteLogRef = db.collection("voteLogs").doc();
                t.set(voteLogRef, {
                  id: voteRefToDelete.id,
                  deleted: true
                });
                t.delete(voteRefToDelete);
              }
              for (let voterUpdate of voterUpdates) {
                t.update(voterUpdate.voterRef, voterUpdate.voterUpdateData);
                const voterLogRef = db.collection("researcherLogs").doc();
                t.set(voterLogRef, {
                  id: voterUpdate.voterRef.id,
                  ...voterUpdate.voterUpdateData
                });
              }
              const pointsUpdate = {
                projects: {
                  ...researcherData.projects,
                  [activityData.project]: {
                    ...researcherData.projects[activityData.project],
                    points: researcherData.projects[activityData.project].points - activityData.upVotes
                  }
                }
              };
              t.update(researcherRef, pointsUpdate);
              const researcherLogRef = db.collection("researcherLogs").doc();
              t.set(researcherLogRef, {
                id: researcherRef.id,
                ...pointsUpdate
              });
              const activityLogRef = db.collection("activityLogs").doc();
              t.set(activityLogRef, {
                id: activityRef.id,
                deleted: true
              });
              t.delete(activityRef);
            }
          }
        });
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

const voteInstructorFn = async (voter, instructor, vote, comment, voterProject) => {
  try {
    const currentTime = Timestamp.fromDate(new Date());
    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const instructorRef = db.collection("instructors").doc(instructor);
      const instructorDoc = await t.get(instructorRef);
      if (instructorDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const instructorData = instructorDoc.data();
        const researcherRef = db.collection("researchers").doc(instructorData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("instructorVotes")
          .where("instructor", "==", instructor)
          .where("voter", "==", voter)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let downVote = false;
        let newUpVote = vote === "upVote";
        let newDownVote = vote === "downVote";
        let voteRef, voteData, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("instructorVotes").doc(voteDocs.docs[0].id);
          voteData = voteDocs.docs[0].data();
          ({ upVote, downVote } = voteData);
          if (newUpVote) {
            newUpVote = !upVote;
            newDownVote = false;
          } else if (newDownVote) {
            newUpVote = false;
            newDownVote = !downVote;
          }
          newVoteData = {
            upVote: newUpVote,
            downVote: newDownVote,
            updatedAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.update(voteRef, newVoteData);
        } else {
          voteRef = db.collection("instructorVotes").doc();
          newVoteData = {
            fullname: instructorData.fullname,
            instructor,
            project: voterProject,
            upVote: newUpVote,
            downVote: newDownVote,
            voter,
            createdAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("instructorVoteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id
        });
        let upVoteVal = 0;
        let downVoteVal = 0;
        if (vote === "upVote") {
          upVoteVal = upVote ? -1 : 1;
          downVoteVal = downVote ? -1 : 0;
        } else if (vote === "downVote") {
          upVoteVal = upVote ? -1 : 0;
          downVoteVal = downVote ? -1 : 1;
        }
        let upVotes = 0;
        if (voterData.projects[voterProject].instructorUpVotes) {
          upVotes = voterData.projects[voterProject].instructorUpVotes;
        }
        let downVotes = 0;
        if (voterData.projects[voterProject].instructorDownVotes) {
          downVotes = voterData.projects[voterProject].instructorDownVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [voterProject]: {
              ...voterData.projects[voterProject],
              instructorUpVotes: upVotes + upVoteVal,
              instructorDownVotes: downVotes + downVoteVal
            }
          }
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id
        });
        const projectSpecsDoc = await db.collection("projectSpecs").doc(instructorData.project).get();
        const projectPoints = projectSpecsDoc.data().points;
        if ("dayInstructorUpVotes" in projectPoints) {
          let instructors = 0;

          let projectToUpdate =
            instructorData.project in researcherData?.projects
              ? instructorData.project
              : Object.keys(researcherData?.projects)[0];

          if (researcherData.projects[projectToUpdate]?.instructors) {
            instructors = researcherData.projects[projectToUpdate].instructors;
          }

          const researcherProjectUpdates = {
            projects: {
              ...researcherData.projects,
              [projectToUpdate]: {
                ...researcherData.projects[projectToUpdate],
                instructors: instructors + upVoteVal / 10
              }
            }
          };
          t.update(researcherRef, researcherProjectUpdates);
          const researcherLogRef = db.collection("researcherLogs").doc();
          t.set(researcherLogRef, {
            ...researcherProjectUpdates,
            updatedAt: currentTime,
            id: researcherRef.id
          });
        }
        let instructorUpVotes = 0;
        if (instructorData.upVotes) {
          instructorUpVotes = instructorData.upVotes;
        }
        let instructorDownVotes = 0;
        if (instructorData.downVotes) {
          instructorDownVotes = instructorData.downVotes;
        }
        const instructorUpdates = {
          upVotes: instructorUpVotes + upVoteVal,
          downVotes: instructorDownVotes + downVoteVal
        };
        if (comment) {
          if (!("comments" in instructorData)) {
            instructorUpdates.comments = [comment];
          } else if (voteData && voteData.comment !== comment) {
            instructorUpdates.comments = instructorData.comments.filter(comm => comm !== voteData.comment);
            instructorUpdates.comments.push(comment);
          }
        }
        t.update(instructorRef, instructorUpdates);
        const instructorLogRef = db.collection("instructorLogs").doc();
        t.set(instructorLogRef, {
          id: instructorRef.id,
          updatedAt: currentTime,
          ...instructorUpdates
        });
      }
    });
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};

exports.voteInstructorEndpoint = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    const vote = req.body.vote;
    const comment = req.body.comment || "";
    const voterProject = req.body.voterProject;
    if (instructor && vote && voterProject) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteInstructorFn(userDocs.docs[0].id, instructor, vote, comment, voterProject);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteInstructorReset = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    if (instructor) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const currentTime = Timestamp.fromDate(new Date());
        await db.runTransaction(async t => {
          const instructorRef = db.collection("instructors").doc(instructor);
          const instructorDoc = await t.get(instructorRef);
          if (instructorDoc.exists) {
            const voteQuery = db.collection("instructorVotes").where("instructor", "==", instructor);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("instructorVotes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                downVote: false,
                updatedAt: currentTime
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("instructorVoteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id
              });
            }
            const instructorUpdates = {
              upVotes: 0,
              downVotes: 0
            };
            t.update(instructorRef, instructorUpdates);
            const instructorLogRef = db.collection("instructorLogs").doc();
            t.set(instructorLogRef, {
              id: instructorRef.id,
              updatedAt: currentTime,
              ...instructorUpdates
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

const voteAdministratorFn = async (voter, administrator, vote, comment, voterProject) => {
  try {
    const currentTime = Timestamp.fromDate(new Date());
    await db.runTransaction(async t => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const administratorRef = db.collection("administrators").doc(administrator);
      const administratorDoc = await t.get(administratorRef);
      if (administratorDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const administratorData = administratorDoc.data();
        const researcherRef = db.collection("researchers").doc(administratorData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("administratorVotes")
          .where("administrator", "==", administrator)
          .where("voter", "==", voter)
          .limit(1);
        const voteDocs = await t.get(voteQuery);
        let upVote = false;
        let downVote = false;
        let newUpVote = vote === "upVote";
        let newDownVote = vote === "downVote";
        let voteRef, voteData, newVoteData;
        if (voteDocs.docs.length > 0) {
          voteRef = db.collection("administratorVotes").doc(voteDocs.docs[0].id);
          voteData = voteDocs.docs[0].data();
          ({ upVote, downVote } = voteData);
          if (newUpVote) {
            newUpVote = !upVote;
            newDownVote = false;
          } else if (newDownVote) {
            newUpVote = false;
            newDownVote = !downVote;
          }
          newVoteData = {
            upVote: newUpVote,
            downVote: newDownVote,
            updatedAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.update(voteRef, newVoteData);
        } else {
          voteRef = db.collection("administratorVotes").doc();
          newVoteData = {
            fullname: administratorData.fullname,
            administrator,
            project: voterProject,
            upVote: newUpVote,
            downVote: newDownVote,
            voter,
            createdAt: currentTime
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("administratorVoteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id
        });
        let upVoteVal = 0;
        let downVoteVal = 0;
        if (vote === "upVote") {
          upVoteVal = upVote ? -1 : 1;
          downVoteVal = downVote ? -1 : 0;
        } else if (vote === "downVote") {
          upVoteVal = upVote ? -1 : 0;
          downVoteVal = downVote ? -1 : 1;
        }
        let upVotes = 0;
        if (voterData.projects[voterProject].administratorUpVotes) {
          upVotes = voterData.projects[voterProject].administratorUpVotes;
        }
        let downVotes = 0;
        if (voterData.projects[voterProject].administratorDownVotes) {
          downVotes = voterData.projects[voterProject].administratorDownVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [voterProject]: {
              ...voterData.projects[voterProject],
              administratorUpVotes: upVotes + upVoteVal,
              administratorDownVotes: downVotes + downVoteVal
            }
          }
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id
        });
        const projectSpecsDoc = await db.collection("projectSpecs").doc(administratorData.project).get();
        const projectPoints = projectSpecsDoc.data().points;
        if ("dayAdministratorUpVotes" in projectPoints) {
          let administrators = 0;
          if (researcherData.projects[administratorData.project].administrators) {
            administrators = researcherData.projects[administratorData.project].administrators;
          }
          const researcherProjectUpdates = {
            projects: {
              ...researcherData.projects,
              [administratorData.project]: {
                ...researcherData.projects[administratorData.project],
                administrators: administrators + upVoteVal / 10
              }
            }
          };
          t.update(researcherRef, researcherProjectUpdates);
          const researcherLogRef = db.collection("researcherLogs").doc();
          t.set(researcherLogRef, {
            ...researcherProjectUpdates,
            updatedAt: currentTime,
            id: researcherRef.id
          });
        }
        let administratorUpVotes = 0;
        if (administratorData.upVotes) {
          administratorUpVotes = administratorData.upVotes;
        }
        let administratorDownVotes = 0;
        if (administratorData.downVotes) {
          administratorDownVotes = administratorData.downVotes;
        }
        const administratorUpdates = {
          upVotes: administratorUpVotes + upVoteVal,
          downVotes: administratorDownVotes + downVoteVal
        };
        if (comment) {
          if (!("comments" in administratorData)) {
            administratorUpdates.comments = [comment];
          } else if (voteData && voteData.comment !== comment) {
            administratorUpdates.comments = administratorData.comments.filter(comm => comm !== voteData.comment);
            administratorUpdates.comments.push(comment);
          }
        }
        t.update(administratorRef, administratorUpdates);
        const administratorLogRef = db.collection("administratorLogs").doc();
        t.set(administratorLogRef, {
          id: administratorRef.id,
          updatedAt: currentTime,
          ...administratorUpdates
        });
      }
    });
  } catch (e) {
    console.log("Transaction failure:", e);
  }
};

exports.voteAdministratorEndpoint = async (req, res) => {
  try {
    const administrator = req.body.administrator;
    const vote = req.body.vote;
    const comment = req.body.comment;
    const voterProject = req.body.voterProject;
    if (administrator && vote && voterProject) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        await voteAdministratorFn(userDocs.docs[0].id, administrator, vote, comment, voterProject);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.voteAdministratorReset = async (req, res) => {
  try {
    const administrator = req.body.administrator;
    if (administrator) {
      const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
      const userDocs = await db.collection("users").where("uid", "==", authUser.uid).limit(1).get();
      if (userDocs.docs.length > 0) {
        const currentTime = Timestamp.fromDate(new Date());
        await db.runTransaction(async t => {
          const administratorRef = db.collection("administrators").doc(administrator);
          const administratorDoc = await t.get(administratorRef);
          if (administratorDoc.exists) {
            const voteQuery = db.collection("administratorVotes").where("administrator", "==", administrator);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("administratorVotes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                downVote: false,
                updatedAt: currentTime
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("administratorVoteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id
              });
            }
            const administratorUpdates = {
              upVotes: 0,
              downVotes: 0
            };
            t.update(administratorRef, administratorUpdates);
            const administratorLogRef = db.collection("administratorLogs").doc();
            t.set(administratorLogRef, {
              id: administratorRef.id,
              updatedAt: currentTime,
              ...administratorUpdates
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errMsg: err.message });
  }
};

exports.remindResearchersForAvailability = async context => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    // let waitTime = 0;
    // const researchersInfo = [];

    // Retrieve all the researchers to check availabilities per researcher,
    // per project, only if the researcher is active in that project.
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      if ("projects" in researcherData) {
        for (const project in researcherData.projects) {
          if (
            researcherData.projects[project].hasOwnProperty("active") &&
            researcherData.projects[project].active &&
            researcherData.projects[project].hasOwnProperty("scheduleSessions") &&
            researcherData.projects[project].scheduleSessions
          ) {
            // month for next 10 days
            const month = moment().utcOffset(-4).add(10, "day").startOf("month").format("YYYY-MM-DD");
            const resSchedules = await db
              .collection("resSchedule")
              .where("project", "==", project)
              .where("researchers", "array-contains", researcherDoc.id)
              .where("month", "==", month)
              .get();

            let lastAvailability = new Date();
            if (resSchedules.docs.length) {
              const resSchedule = resSchedules.docs[0];
              const resScheduleData = resSchedule.data();
              const availabilities = resScheduleData.schedules[researcherDoc.id] || [];
              for (const availability of availabilities) {
                const _availability = moment(availability).utcOffset(-4, true).toDate();
                if (_availability.getTime() > lastAvailability.getTime()) {
                  lastAvailability = _availability;
                }
              }
            }

            let tenDaysLater = new Date();
            tenDaysLater = new Date(tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000);
            if (lastAvailability.getTime() < tenDaysLater.getTime()) {
              // Increase waitTime by a random integer between 1 to 4 seconds.
              const waitTime = 1000 * (1 + Math.floor(Math.random() * 4));
              // Send a reminder email to a researcher that they have not specified
              // their availability for the next ten days and ask them to specify it.
              await remindResearcherToSpecifyAvailability(researcherData.email, researcherDoc.id, "ten");
              await delay(waitTime);
            }
          }
        }
        /* researchersInfo.push({
          fullname: researcherDoc.id,
          email: researcherData.email,
          projects: Object.keys(researcherData.projects)
        }); */
      }
    }
    return null;
  } catch (error) {
    console.log({ error });
  }
};


const getUserDocsfromEmail = async email => {
  let userDocs = await db.collection("users").where("email", "==", email.toLowerCase()).get();

  if (userDocs.docs.length === 0) {
    userDocs = await db.collection("instructors").where("email", "==", email.toLowerCase()).get();
  }

  if (userDocs.docs.length === 0) {
    userDocs = await db.collection("usersStudentCoNoteSurvey").where("email", "==", email.toLowerCase()).get();
  }

  return userDocs;
};
exports.getUserDocsfromEmail = getUserDocsfromEmail;

// This is called in a pubsub every 4 hours.
// Email reminders to researchers and participants to do the following:
// For future Google Calendar events, to:
// - Accept their invitations
// - Reschedule if they have declined them
// For passed Google Calendar events, to:
// - Reschedule if they have missed or declined them.
exports.remindCalendarInvitations = async context => {
  try {
    // researchers = an object of emails as keys and the corresponding fullnames as values.
    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      if (!researcherData.email) continue;
      researchers[researcherData.email.toLowerCase()] = researcherDoc.id;
    }
    // Retrieve all the scheduled sessions.
    // Having an id means the document is not just an availability, but there
    // is a corresponding Google Calendar event with the specified id.
    const scheduleDocs = await db.collection("schedule").orderBy("id").get();
    // Collect all the data for these documents in an array.
    const schedule = {};
    for (let scheduleDoc of scheduleDocs.docs) {
      const scheduleData = scheduleDoc.data();
      const scheduleEventId = scheduleData.id;
      delete scheduleData.id;
      schedule[scheduleEventId] = {
        ...scheduleData,
        schId: scheduleDoc.id
      };
    }
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    const allEvents = await futureEvents(40);
    const currentTime = new Date().getTime();
    // Each Google Calendar event has {start, end, attendees}.
    // Each attendee has {email, responseStatus}
    // attendee.responseStatus can take one of these possible values:
    // 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of allEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      // Find the scheduled session corresponding to this event.
      if (ev.id in schedule && "attendees" in ev && Array.isArray(ev.attendees)) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase()
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          if (attendee.responseStatus !== "accepted") {
            // If the attendee is a researcher:
            if (attendee.email.toLowerCase() in researchers) {
              // Send a reminder email to a researcher that they have not accepted
              // or even declined the Google Calendar invitation and asks them to
              // accept it or ask someone else to take it.
              setTimeout(() => {
                researcherEventNotificationEmail(
                  attendee.email.toLowerCase(),
                  researchers[attendee.email.toLowerCase()],
                  participant.email,
                  hoursLeft,
                  order,
                  attendee.responseStatus === "declined" || attendee.responseStatus === "tentative"
                );
              }, waitTime);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
            }
            // Find the attendee who corresponds to this participant:
            else if (attendee.email.toLowerCase() === participant.email) {
              // The only way to get the user data, like their firstname, which
              // sessions they have completed so far, ... is through "users"
              const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

              if (userDocs.docs.length > 0) {
                const userData = userDocs.docs[0].data();
                participant.firstname = userData.firstname;
                if (userData.course) {
                  participant.courseName = userData.course;
                } else {
                  participant.courseName = "";
                }
                // If the user has answered postQ2Choice it means they have
                // completed the 1st session.
                if (userData.postQ2Choice) {
                  participant.firstDone = true;
                } else {
                  participant.firstDone = false;
                }
                // If the user has answered post3DaysQ2Choice it means they have
                // completed the 2nd session.
                if (userData.post3DaysQ2Choice) {
                  participant.secondDone = true;
                } else {
                  participant.secondDone = false;
                }
                // If the user has completed all the experiment sessions, then
                // projectDone should be true.
                if (userData.projectDone) {
                  participant.thirdDone = true;
                } else {
                  participant.thirdDone = false;
                }

                // We consider "declined" and "tentative" responses as declined.
                if (attendee.responseStatus === "declined" || attendee.responseStatus === "tentative") {
                  // If they have declined the 1st session, but they are not done
                  // with the 1st session:
                  if (order === "1st" && !participant.firstDone) {
                    // Then, we delete all their sessions from Google Calendar and
                    // schedule them, send them an email asking them to reschedule
                    // all their sessions.
                    setTimeout(() => {
                      reschEventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        true,
                        true,
                        null
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  } else if (
                    (order === "2nd" && !participant.secondDone) ||
                    (order === "3rd" && !participant.thirdDone)
                  ) {
                    // If the session is 2nd/3rd, but they have not completed the
                    // corresponding session:
                    // Then, we send them an email asking them to reschedule
                    // their 2nd/3rd session on the same day, otherwise their
                    // application would be withdrawn.
                    setTimeout(() => {
                      eventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        "",
                        order,
                        false,
                        true
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  }
                } else if (
                  // If they have not declined, but did not accept either, and
                  // less than 25 hours is left to the start of their experiment session:
                  hoursLeft <= 25
                ) {
                  // If it's their 3rd session, but they did not complete their 2nd session:
                  if (order === "3rd" && !participant.secondDone) {
                    // Delete the 3rd session, because logically they should not go through
                    // the 3rd session without completing the 2nd one.
                    await deleteEvent(ev.id);
                    // Also, remove the Calendar event id and order from their schedule doc.
                    const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                    await scheduleRef.update({
                      id: FieldValue.delete(),
                      order: FieldValue.delete()
                    });
                  } else {
                    setTimeout(() => {
                      // Email every four hours to remind them that they need to accept the
                      // Google Calendar invite for whichever session they have not accepted yet.
                      eventNotificationEmail(
                        participant.email,
                        participant.firstname,
                        false,
                        participant.courseName,
                        hoursLeft,
                        false,
                        "",
                        order,
                        false,
                        false
                      );
                    }, waitTime);
                    // Increase waitTime by a random integer between 1 to 4 seconds.
                    waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                  }
                }
              }
            }
          }
        }
      }
    }
    // Look into all Google Calendar sessions in the past 40 days:
    const pastEvs = await pastEvents(40);
    for (let ev of pastEvs) {
      const startTime = new Date(ev.start.dateTime);
      // Because some people may spend more time in their sessions,
      // we should consider the fact that while someone has not ended their session yet,
      // this PubSub may be invoked. To prevent that we define the end time an hour after the actual end time of the session.
      const endTimeStamp = new Date(ev.end.dateTime).getTime() + 60 * 60 * 1000;
      const hoursLeft = (currentTime - startTime.getTime()) / (60 * 60 * 1000);
      if (
        endTimeStamp < currentTime &&
        // Find the scheduled session corresponding to this event.
        ev.id in schedule &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase()
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          // We only need to check the past events for the participants.
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
            // The only way to get the user data, like their firstname, which
            // sessions they have completed so far, ... is through "users"
            const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

            if (userDocs.docs.length > 0) {
              const userData = userDocs.docs[0].data();
              participant.firstname = userData.firstname;
              if (userData.course) {
                participant.courseName = userData.course;
              } else {
                participant.courseName = "";
              }
              if (userData.postQ2Choice) {
                participant.firstDone = true;
              } else {
                participant.firstDone = false;
              }
              if (userData.post3DaysQ2Choice) {
                participant.secondDone = true;
              } else {
                participant.secondDone = false;
              }
              if (userData.post1WeekQ2Choice) {
                participant.thirdDone = true;
              } else {
                participant.thirdDone = false;
              }

              // For project Annotating (survey) we will not have firstDone field in the participant
              // So if they missed they attended the first session that that means
              // the schedule object should have a hasStarted field

              const participantAttendedFirstSession =
                userData.project === "Annotating" ? schedule.attended : participant.firstDone;

              if (order === "1st" && !participantAttendedFirstSession) {
                // Then, we delete all their sessions from Google Calendar and
                // schedule then, send them an email asking them to reschedule
                // all their sessions.
                setTimeout(() => {
                  reschEventNotificationEmail(
                    participant.email,
                    participant.firstname,
                    false,
                    participant.courseName,
                    hoursLeft,
                    false,
                    attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                    null
                  );
                }, waitTime);
                waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
              } else if (order === "3rd" && !participant.secondDone) {
                // If it's their 3rd session, but they did not complete their 2nd session:
                // Delete the 3rd session, because logically they should not go through
                // the 3rd session without completing the 2nd one .
                await deleteEvent(ev.id);
                // Also, remove the Calendar event id and order from their schedule doc.
                const scheduleRef = db.collection("schedule").doc(schedule[ev.id].schId);
                await scheduleRef.update({
                  id: FieldValue.delete(),
                  order: FieldValue.delete()
                });
              } else if (isToday(startTime)) {
                // Only if it is a 2nd/3rd session that was scheduled today, but they
                // missed it, we email them to reschedule their session on the same day;
                // otherwise, we will withdraw their application.
                if ((order === "2nd" && !participant.secondDone) || (order === "3rd" && !participant.thirdDone)) {
                  setTimeout(() => {
                    notAttendedEmail(participant.email, participant.firstname, false, participant.courseName, order);
                  }, waitTime);
                  waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log({ err });
    return null;
  }
};

exports.passagesNumberCorrection = async context => {
  try {
    const passageNumberOfParticipant = {};
    const usersDocs = await db.collection("users").get();
  
    usersDocs.forEach((userDoc) => {
      const userData = userDoc.data();
  
      const hasRequiredData =
        userData.explanations &&
        userData.explanations1Week &&
        userData.explanations3Days &&
        !userData.damagedDocument;
  
      if (hasRequiredData) {
        userData.pConditions.forEach((cond) => {
          const { project } = userData;
          const { passage, condition } = cond;
  
          if (!passageNumberOfParticipant[passage]) {
            passageNumberOfParticipant[passage] = {};
          }
  
          if (!passageNumberOfParticipant[passage][project]) {
            passageNumberOfParticipant[passage][project] = {};
          }
  
          if (!passageNumberOfParticipant[passage][project][condition]) {
            passageNumberOfParticipant[passage][project][condition] = 0;
          }
  
          passageNumberOfParticipant[passage][project][condition]++;
        });
      }
    });
    for (const passage in passageNumberOfParticipant) {
      const passageRef = db.collection("passages").doc(passage);
      const passageData = (await passageRef.get()).data();
      const projects = passageData.projects || {};
      for (const project in passageNumberOfParticipant[passage]) {
        projects[project] = passageNumberOfParticipant[passage][project];
      }
      await passageRef.update({ projects });
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

exports.createTemFeedback = async (req, res) => {
  try {

      const { fullname, project } = req.body;
      if (!fullname || !project) {
        return res.status(500).send({
          message: "some parameters are missing"
        });
      }

      const feedbackCodesBooksDocs = await db.collection("feedbackCodeBooks").get();

      const previousIds = [];
      const feedbackCodesOrders = await db.collection("feedbackCodeOrderV2").where("project", "==", project).get();
      for (let feedbackCodeOrder of feedbackCodesOrders.docs) {
        const feedbackCodeOrderData = feedbackCodeOrder.data();
        previousIds.concat(feedbackCodeOrderData.codeIds);
      }

      const batch = db.batch();

      const approvedCodes = new Set();
      for (let codeDoc of feedbackCodesBooksDocs.docs) {
        const codeData = codeDoc.data();
        if (codeData.approved && !approvedCodes.has(codeData.code)) {
          approvedCodes.add(codeData.code);
        }
      }
      const passages = await db.collection("passages").where("projects", "array-contains", project).get();
      const passagesMap = {};
      for (const passage of passages.docs) {
        passagesMap[passage.id] = passage.data();
      }
      /* const passagesInH2K2 = [
        "zlS4Gh2AXaLZV7HM2oXd",
        "lmGQvzSit4LBTj1Zptot",
        "97D6P4unPYqzkpVeUY2c",
        "zbcUNl5593vOeChp1G8O",
        "UowdqbVHYMJ9Hhh5zNY3",
        "qOO4Yn9oyUthKaifSIl1",
        "6rc4k1su3txN6ZK4CJ0h",
        "xuNQUYbAEFfTD1PHuLGV",
        "s1oo3G4n3jeE8fJQRs3g"
      ]; */

      const feedbackCodes = await db
        .collection("feedbackCode")
        .where("project", "==", project)
        .where("approved", "==", false)
        .get();
      const feedbackCodesByParticipant = {};

      for (const feedbackCode of feedbackCodes.docs) {
        if (previousIds.includes(feedbackCode.id)) continue;
        const feedbackCodeData = feedbackCode.data();
        if (!feedbackCodesByParticipant[feedbackCodeData.fullname]) {
          feedbackCodesByParticipant[feedbackCodeData.fullname] = [];
        }
        feedbackCodesByParticipant[feedbackCodeData.fullname].push({
          docId: feedbackCode.id,
          session: feedbackCodeData.session,
          explanation: feedbackCodeData.explanation || ""
        });
      }
      const feedbackCodeIds = [];
      const feedbackCodeOrders = await db
        .collection("feedbackCodeOrderV2")
        .where("project", "==", project)
        .where("researcher", "==", fullname)
        .get();
      let feedbackCodeOrderRef;
      if (!feedbackCodeOrders.docs.length) {
        feedbackCodeOrderRef = db.collection("feedbackCodeOrderV2").doc();
      } else {
        feedbackCodeOrderRef = db.collection("feedbackCodeOrderV2").doc(feedbackCodeOrders.docs[0].id);
      }
      const feedbackCodeData = feedbackCodeOrders.docs.length
        ? feedbackCodeOrders.docs[0].data()
        : {
            project: project.trim(),
            researcher: fullname,
            codeIds: []
          };
      console.log("feedbackCodeIds", feedbackCodeIds);
      const codeIds = Array.from(new Set([...feedbackCodeIds, ...feedbackCodeData.codeIds]));

      if (codeIds.length <= 2) {
        for (let participant in feedbackCodesByParticipant) {
          for (const feedbackCode of feedbackCodesByParticipant[participant]) {
            const explanationWords = feedbackCode.explanation.split(" ").filter(w => w.trim());
            console.log(explanationWords);
            if (explanationWords.length < 4 || codeIds.includes(feedbackCode.docId)) {
              continue;
            }
            codeIds.push(feedbackCode.docId);
            if (codeIds.length > 5) {
              break;
            }
          }
          if (codeIds.length > 5) {
            break;
          }
        }
      }
      feedbackCodeData.codeIds = codeIds;

      if (feedbackCodeOrders.docs.length) {
        batch.update(feedbackCodeOrderRef, feedbackCodeData);
      } else {
        batch.set(feedbackCodeOrderRef, feedbackCodeData);
      }

      await batch.commit();
    
  } catch (error) {
    console.log({ error }, "error----------");
  }
};
