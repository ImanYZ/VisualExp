const { admin, db, commitBatch, batchUpdate } = require("./admin");
const { Storage } = require("@google-cloud/storage");
const { futureEvents, pastEvents } = require("./scheduling");
const { isToday, fetchRecentParticipants } = require("./utils");
const { delay } = require("./helpers/common");
const {
  participantNotificationEmail,
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
              const intellectualNum = researcherData.projects[activityData.project].intellectualNum - 1;
              const pointsUpdate = {
                projects: {
                  ...researcherData.projects,
                  [activityData.project]: {
                    ...researcherData.projects[activityData.project],
                    points: researcherData.projects[activityData.project].points - activityData.upVotes,
                    intellectualNum: intellectualNum > 0 ? intellectualNum : 0
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
            const scheduleMonths = [
              moment().utcOffset(-4).startOf("month").format("YYYY-MM-DD"),
              moment().utcOffset(-4).startOf("month").add(1, "months").format("YYYY-MM-DD")
            ];
            const resSchedules = await db.collection("resSchedule").where("month", "in", scheduleMonths).get();
            let lastAvailability = new Date();
            if (resSchedules.docs.length) {
              for (let resScheduleDoc of resSchedules.docs) {
                const resScheduleData = resScheduleDoc.data();
                const availabilities = resScheduleData.schedules[researcherDoc.id] || [];
                for (const availability of availabilities) {
                  const _availability = moment(availability).utcOffset(-4, true).toDate();
                  if (_availability.getTime() > lastAvailability.getTime()) {
                    lastAvailability = _availability;
                  }
                }
              }
            }
            let tenDaysLater = new Date();
            tenDaysLater = new Date(tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000);
            let sevenDaysLater = new Date();
            sevenDaysLater = new Date(sevenDaysLater.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (
              (lastAvailability.getTime() < tenDaysLater.getTime() && project !== "OnlineCommunities") ||
              (lastAvailability.getTime() < sevenDaysLater.getTime() && project === "OnlineCommunities")
            ) {
              const days = project === "OnlineCommunities" ? "seven" : "ten";
              console.log(researcherData.email, researcherDoc.id, project);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              const waitTime = 1000 * (1 + Math.floor(Math.random() * 4));
              // Send a reminder email to a researcher that they have not specified
              // their availability for the next ten days and ask them to specify it.
              await remindResearcherToSpecifyAvailability(researcherData.email, researcherDoc.id, days, project);
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
  let userDocs = await db.collection("users").where("email", "==", email).get();
  const usersSurveyDocs = await db.collection("usersSurvey").where("email", "==", email).get();
  return [...userDocs.docs, ...usersSurveyDocs.docs];
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
    console.log("remindCalendarInvitations");
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
      schedule[scheduleData.id] = {
        ...scheduleData,
        schId: scheduleDoc.id
      };
    }
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    const _futureEvents = await futureEvents(40);
    const currentTime = new Date().getTime();
    // Each Google Calendar event has {start, end, attendees}.
    // Each attendee has {email, responseStatus}
    // attendee.responseStatus can take one of these possible values:
    // 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of _futureEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      // Find the scheduled session corresponding to this event.
      if (ev.id in schedule && "attendees" in ev && Array.isArray(ev.attendees)) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase(),
          project: schedule[ev.id].project
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          if (attendee.responseStatus !== "accepted") {
            // If the attendee is a researcher:
            if (attendee.email.toLowerCase() in researchers) {
              // Send a reminder email to a researcher that they have not accepted
              // or even declined the Google Calendar invitation and asks them to
              // accept it or ask someone else to take it.
              researcherEventNotificationEmail(
                attendee.email.toLowerCase(),
                researchers[attendee.email.toLowerCase()],
                participant.email,
                hoursLeft,
                order,
                attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                schedule[ev.id].project
              );
            }
            // Find the attendee who corresponds to this participant:
            else if (attendee.email.toLowerCase() === participant.email) {
              // The only way to get the user data, like their firstname, which
              // sessions they have completed so far, ... is through "users"
              const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());

              if (userDocs.length > 0) {
                for (let userDoc of userDocs) {
                  const userData = userDoc.data();
                  if (userData.project !== participant.project) continue;
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
                    if (order === "1st" && attendee.responseStatus === "declined") {
                      // Then, we delete all their sessions from Google Calendar and
                      // schedule them, send them an email asking them to reschedule
                      // all their sessions.
                      participantNotificationEmail(
                        participant.email,
                        participant.firstname,
                        hoursLeft,
                        attendee.responseStatus === "declined",
                        userData
                      );
                    } else if (
                      (order === "2nd" && !participant.secondDone) ||
                      (order === "3rd" && !participant.thirdDone)
                    ) {
                      // If the session is 2nd/3rd, but they have not completed the
                      // corresponding session:
                      // Then, we send them an email asking them to reschedule
                      // their 2nd/3rd session on the same day, otherwise their
                      // application would be withdrawn.
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
                        true,
                        userData.project
                      );
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
                      // Email every four hours to remind them that they need to accept the
                      // Google Calendar invite for whichever session they have not accepted yet.
                      if (!userData.hasOwnProperty("surveyType") || userData.surveyType !== "instructor") {
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
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    // Look into all Google Calendar sessions in the past 40 days:
    const _pastEvents = await pastEvents(40);
    for (let ev of _pastEvents) {
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
          email: schedule[ev.id].email.toLowerCase(),
          project: schedule[ev.id].project
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          // We only need to check the past events for the participants.
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
            // The only way to get the user data, like their firstname, which
            // sessions they have completed so far, ... is through "users"
            const userDocs = await getUserDocsfromEmail(attendee.email.toLowerCase());
            if (userDocs.length > 0) {
              for (let userDoc of userDocs) {
                const userData = userDoc.data();
                if (userData.project !== participant.project) continue;
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
                if (userData.hasOwnProperty("surveyType")) {
                  participant.surveyType = userData.surveyType;
                }
                if (userData.hasOwnProperty("instructorId")) {
                  participant.instructorId = userData.instructorId;
                }
                // For project OnlineCommunities (survey) we will not have firstDone field in the participant
                // So if they missed they attended the first session  that means
                // the schedule object should have a attended field
                const participantAttendedFirstSession =
                  participant.project === "OnlineCommunities" ? schedule[ev.id].attended : participant.firstDone;
                if (order === "1st" && !participantAttendedFirstSession) {
                  // Then, we delete all their sessions from Google Calendar and
                  // schedule then, send them an email asking them to reschedule
                  // all their sessions.

                  participantNotificationEmail(
                    participant.email,
                    participant.firstname,
                    hoursLeft,
                    attendee.responseStatus === "declined" || attendee.responseStatus === "tentative",
                    participant
                  );
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
                    notAttendedEmail(participant.email, participant.firstname, false, participant.courseName, order);
                  }
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

    usersDocs.forEach(userDoc => {
      const userData = userDoc.data();

      const hasRequiredData =
        userData.explanations && userData.explanations1Week && userData.explanations3Days && !userData.damagedDocument;

      if (hasRequiredData) {
        userData.pConditions.forEach(cond => {
          const { project } = userData;
          const { passage, condition } = cond;

          if (!passageNumberOfParticipant.hasOwnProperty(passage)) {
            passageNumberOfParticipant[passage] = {};
          }

          if (!passageNumberOfParticipant[passage].hasOwnProperty(project)) {
            passageNumberOfParticipant[passage][project] = {};
          }

          if (!passageNumberOfParticipant[passage][project].hasOwnProperty(condition)) {
            passageNumberOfParticipant[passage][project][condition] = 0;
          }

          passageNumberOfParticipant[passage][project][condition] += 1;
        });
      }
    });
    for (const passage in passageNumberOfParticipant) {
      const passageRef = db.collection("passages").doc(passage);
      const passageData = (await passageRef.get()).data();
      const projects = passageData.projects || {};
      for (const project in projects) {
        if (project === "H1L2" || project === "H2K2") {
          for (let condition in projects[project]) {
            projects[project][condition] = 0;
          }
        }
      }
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

exports.retreiveFeedbackcodes = async (req, res) => {
  try {
    const { fullname } = req.body;
    const codeIds = {};
    const recentParticipants = await fetchRecentParticipants(fullname);
    if (!fullname) {
      return res.status(500).send({
        message: "some parameters are missing"
      });
    }
    const feedbackCodes = await db.collection("feedbackCode").where("approved", "==", false).get();
    for (const feedbackCode of feedbackCodes.docs) {
      const feedbackCodeData = feedbackCode.data();
      if (!feedbackCodeData.coders.includes(fullname)) {
        const explanationWords = feedbackCodeData.explanation.split(" ").filter(w => w.trim());
        if (
          explanationWords.length < 4 &&
          (!recentParticipants.hasOwnProperty(feedbackCodeData.project) ||
            !Object.keys(recentParticipants[feedbackCodeData.project]).includes(feedbackCode.fullname))
        ) {
          continue;
        }
        if (codeIds.hasOwnProperty(feedbackCodeData.project)) {
          codeIds[feedbackCodeData.project].push({ ...feedbackCodeData, docId: feedbackCode.id });
        } else {
          codeIds[feedbackCodeData.project] = [{ ...feedbackCodeData, docId: feedbackCode.id }];
        }
      }
    }
    for (let project in codeIds) {
      const recent = recentParticipants[project];
      codeIds[project].sort((g1, g2) => {
        return g1.coders.length > g2.coders.length ? -1 : 1;
      });
      codeIds[project].sort((g1, g2) => {
        const p1 = Object.keys(recent).includes(g1.fullname) && recent[g1?.fullname].includes(g1.session);
        const p2 = Object.keys(recent).includes(g2.fullname) && recent[g2?.fullname].includes(g2.session);
        if (p1 && p2) return 0;
        return p1 && !p2 ? -1 : 1;
      });
    }
    res.status(200).send({ message: "success", codeIds });
  } catch (error) {
    console.log({ error }, "error----------");
  }
};

//post lodResponses
exports.loadResponses = async (req, res) => {
  try {
    const _all = {};
    const { researcher } = req.body;
    console.log(researcher);
    const recallGradesDocs = await db.collection("recallGradesV2").select("sessions").get();
    console.log("Done Loading");
    const promises = recallGradesDocs.docs.map(async recallDoc => {
      const recallData = recallDoc.data();
      await Promise.all(
        Object.entries(recallData.sessions).map(async ([session, conditionItems]) => {
          await Promise.all(
            conditionItems.map(async conditionItem => {
              if (conditionItem.response !== "") {
                const votes = {};
                await Promise.all(
                  conditionItem.phrases.map(async phrase => {
                    const resIdx = phrase.researchers.indexOf(researcher);
                    votes[phrase.phrase] = {
                      vote: resIdx !== -1 ? phrase.grades[resIdx] : null
                    };
                  })
                );
                if (_all.hasOwnProperty(conditionItem.passage)) {
                  _all[conditionItem.passage].push({
                    response: conditionItem.response.trim(),
                    documentId: recallDoc.id,
                    session,
                    condition: conditionItem.condition,
                    votes
                  });
                } else {
                  _all[conditionItem.passage] = [
                    {
                      response: conditionItem.response.trim(),
                      documentId: recallDoc.id,
                      session,
                      condition: conditionItem.condition,
                      votes
                    }
                  ];
                }
              }
            })
          );
        })
      );
    });
    await Promise.all(promises);
    res.status(200).send({ message: "success", responses: _all });
  } catch (error) {
    res.status(500).send({ message: "error", data: error });
    console.log(error);
  }
};

const updateGradingPoints = (
  upVoteResearchers,
  downVoteResearchers,
  recallData,
  upVotePoint,
  downVotePoint,
  researchersUpdates
) => {
  const updatePoints = (researcher, project, votePoint) => {
    if (researchersUpdates[researcher].projects.hasOwnProperty(project)) {
      let { gradingPoints = 0, negativeGradingPoints = 0 } = researchersUpdates[researcher].projects[project];
      gradingPoints += votePoint;
      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }
      researchersUpdates[researcher].projects[project].gradingPoints = gradingPoints;
      researchersUpdates[researcher].projects[project].negativeGradingPoints = negativeGradingPoints;
    }
  };

  upVoteResearchers.forEach(researcher => {
    updatePoints(researcher, recallData.project, upVotePoint);
    updatePoints(researcher, "Autograding", upVotePoint);
  });

  downVoteResearchers.forEach(researcher => {
    updatePoints(researcher, recallData.project, downVotePoint);
    updatePoints(researcher, "Autograding", downVotePoint);
  });
};

exports.voteOnSingleRecall = async (req, res) => {
  try {
    console.log("voteOnSingleRecall", req.body);
    const { session, condition, phrase, documentId } = req.body;
    const gptResearcher = "Iman YeckehZaare";
    await db.runTransaction(async t => {
      let transactionWrites = [];
      const recallRef = db.collection("recallGradesV2").doc(documentId);
      const recallDoc = await t.get(recallRef);
      const researchers = await t.get(db.collection("researchers"));
      let researchersUpdates = {};
      for (const researcher of researchers.docs) {
        const researcherData = researcher.data();
        researchersUpdates[researcher.id] = researcherData;
      }
      const recallData = recallDoc.data();
      const conditionItems = recallData.sessions[session];
      const conditionItem = conditionItems.find(item => item.condition === condition);
      const phraseItem = conditionItem.phrases.find(item => item.phrase === phrase);
      const researcherIndex = phraseItem.researchers.indexOf(req.body.researcher);
      const docResearchers = [...phraseItem.researchers];
      const docGrades = [...phraseItem.grades];
      const gptIdx = docResearchers.indexOf(gptResearcher);
      if (gptIdx !== -1) {
        docResearchers.splice(gptIdx, 1);
        docGrades.splice(gptIdx, 1);
      }
      if (researcherIndex === -1) {
        phraseItem.researchers.push(req.body.researcher);
        phraseItem.grades.push(req.body.grade);
        docGrades.push(req.body.grade);
        docResearchers.push(req.body.researcher);
        const previousGrades = {
          // sum of previous up votes from all researchers
          upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), 0),
          // sum of previous up votes from all researchers
          downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), 0)
        };
        if (previousGrades.upVotes >= 3 || previousGrades.downVotes >= 3) {
          phraseItem.previousGrades = previousGrades;
          const upVoteResearchers = [];
          const downVoteResearchers = [];
          for (let r = 0; r < docGrades.length; r++) {
            if (docResearchers[r] === gptResearcher) {
              continue;
            }
            if (docGrades[r]) {
              upVoteResearchers.push(docResearchers[r]);
            } else {
              downVoteResearchers.push(docResearchers[r]);
            }
          }
          let upVotePoint = 0.5;
          let downVotePoint = -0.5;
          if (previousGrades.upVotes < previousGrades.downVotes) {
            upVotePoint = -0.5;
            downVotePoint = 0.5;
          }
          updateGradingPoints(
            upVoteResearchers,
            downVoteResearchers,
            recallData,
            upVotePoint,
            downVotePoint,
            researchersUpdates
          );
          for (const researcherId in researchersUpdates) {
            const researcherRef = db.collection("researchers").doc(researcherId);
            transactionWrites.push({
              type: "update",
              refObj: researcherRef,
              updateObj: researchersUpdates[researcherId]
            });
          }
        }
      } else {
        phraseItem.grades[researcherIndex] = req.body.grade;
      }
      transactionWrites.push({
        type: "update",
        refObj: recallRef,
        updateObj: { sessions: recallData.sessions }
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
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
  }
};

const getRecallConditionsByRecallGrade = (recallGradeDoc, fullname) => {
  const gptResearcher = "Iman YeckehZaare";
  const recallGradeData = recallGradeDoc.data();
  const _conditionItems = [];
  Object.entries(recallGradeData.sessions).map(async ([session, conditionItems]) => {
    conditionItems.forEach(conditionItem => {
      const filtered = (conditionItem.response || "")
        .replace(/[\.,]/g, " ")
        .split(" ")
        .filter(w => w.trim());
      if (
        recallGradeData.user !== fullname &&
        !conditionItem.researchers.includes(fullname) &&
        conditionItem.researchers.filter(researcher => researcher !== gptResearcher).length < 4 &&
        filtered.length > 2
      ) {
        conditionItem.phrases = conditionItem.phrases.filter(p => !p.deleted && !p.researchers.includes(fullname));
        _conditionItems.push({
          docId: recallGradeDoc.id,
          session,
          user: recallGradeData.user,
          project: recallGradeData.project,
          ...conditionItem
        });
      }
    });
  });

  return _conditionItems;
};

const consumeRecallGradesChanges = (recallGradesDocs, fullname) => {
  let recallGrades = {};
  for (const recallGradeDoc of recallGradesDocs) {
    const recallGradeDaa = recallGradeDoc.data();
    const _recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname);
    if (recallGrades.hasOwnProperty(recallGradeDaa.project)) {
      recallGrades[recallGradeDaa.project] = [...recallGrades[recallGradeDaa.project], ..._recallGrades];
    } else {
      recallGrades[recallGradeDaa.project] = [..._recallGrades];
    }
  }
  return recallGrades;
};
exports.loadRecallGrades = async (req, res) => {
  try {
    console.log("loadRecallGrades");
    const { fullname } = req.body;
    const recentParticipants = await fetchRecentParticipants(fullname);
    let recallGradesDocs = await db.collection("recallGradesV2").get();
    let recallGrades = consumeRecallGradesChanges(recallGradesDocs.docs, fullname);
    for (let project in recallGrades) {
      let includeRecentParticipants = recallGrades[project].filter(g =>
        Object.keys(recentParticipants[project]).includes(g.user)
      );
      let dontIncludeRecentParticipants = recallGrades[project].filter(
        g => !Object.keys(recentParticipants[project]).includes(g.user)
      );
      recallGrades[project] = [...includeRecentParticipants, ...dontIncludeRecentParticipants].slice(0, 200);
    }
    res.status(200).send(recallGrades);
  } catch (error) {
    res.status(500).send({ message: "error", data: error });
    console.log(error);
  }
};

exports.updateThematicCode = async (req, res) => {
  try {
    await db.runTransaction(async t => {
      let { oldCodeId, newCode, mergeCode, category, title } = req.body;
      const codeRef = db.collection("feedbackCodeBooks").doc(oldCodeId);
      const thematicAnalysisDocs = await t.get(db.collection("thematicAnalysis"));
      const codeDoc = await t.get(codeRef);
      const codeData = codeDoc.data();
      if (newCode === codeData.code && !mergeCode && category === codeData.category && title === codeData.title) return;
      if (mergeCode) {
        newCode = mergeCode;
        const mergeCodeDoc = await t.get(
          db.collection("feedbackCodeBooks").where("project", "==", "OnlineCommunities").where("code", "==", mergeCode)
        );
        if (mergeCodeDoc.docs.length > 0) {
          t.delete(mergeCodeDoc.docs[0].ref);
        }
      }
      t.update(codeRef, { code: newCode, category, title });
      if (newCode === codeData.code) return;
      for (let thematicAnalysisDoc of thematicAnalysisDocs.docs) {
        const thematicAnalysisData = thematicAnalysisDoc.data();
        const updateCBook = thematicAnalysisData.codesBook;
        Object.keys(updateCBook).forEach(sentence => {
          const index = updateCBook[sentence].indexOf(codeData.code.trim());
          console.log(updateCBook[sentence], index);
          if (index !== -1) {
            updateCBook[sentence][index] = newCode;
          }
          console.log("after", updateCBook[sentence]);
        });
        console.log(updateCBook);
        t.update(db.collection("thematicAnalysis").doc(thematicAnalysisDoc.id), { codesBook: updateCBook });
      }
    });
    return res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "error", data: error });
  }
};

exports.deleteThematicCode = async (req, res) => {
  await db.runTransaction(async t => {
    const { deleteCode } = req.body;
    const codeRef = db.collection("feedbackCodeBooks").doc(deleteCode.id);
    const thematicAnalysisDocs = await t.get(db.collection("thematicAnalysis"));
    for (let thematicAnalysisDoc of thematicAnalysisDocs.docs) {
      const thematicAnalysisData = thematicAnalysisDoc.data();
      const updateCBook = thematicAnalysisData.codesBook;
      Object.keys(updateCBook).forEach(sentence => {
        const index = updateCBook[sentence].indexOf(deleteCode.code.trim());
        console.log(updateCBook[sentence], index);
        if (index !== -1) {
          updateCBook[sentence].splice(index, 1);
          if (updateCBook[sentence].length === 0) delete updateCBook[sentence];
        }
      });
      console.log(updateCBook);
      t.update(db.collection("thematicAnalysis").doc(thematicAnalysisDoc.id), { codesBook: updateCBook });
    }
    t.delete(codeRef);
  });
};

exports.notifyApplicationStatus = async (req, res) => {
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

const storage = new Storage({ projectId: "visualexp-a7d2c" });
const uploadBlobAsAudio = async (blob, filePath) => {
  const bucket = storage.bucket("gs://visualexp-a7d2c.appspot.com");
  await bucket.file(filePath).save(blob.buffer);
  await bucket.file(filePath).makePublic();
};

function convertDataURLToBlob(dataURL) {
  const base64Data = dataURL.split(",")[1];
  const bufferData = Buffer.from(base64Data, "base64");
  const mimeType = dataURL.split(":")[1].split(";")[0];
  return {
    buffer: bufferData,
    size: bufferData.length,
    type: mimeType
  };
}
exports.recordAudio = async (req, res) => {
  try {
    console.log("recordAudio called");
    console.log(req.body.audioBlob);
    const blob = convertDataURLToBlob(req.body.audioBlob);
    const meetingUrl = req.body.meetingUrl;
    let meetingId = "";
    const regex = /[a-z]{3}-[a-z]{4}-[a-z]{3}/;
    const matchResult = meetingUrl.match(regex);
    if (matchResult) {
      meetingId = matchResult[0];
    }
    console.log(blob);
    const filePath = "interviews/" + meetingId.trim() + ".webm";
    await uploadBlobAsAudio(blob, filePath);
    console.log("done");
  } catch (error) {
    console.log(error);
  }
};

exports.submitThematic = async (req, res) => {
  try {
    const { codesBook, transcriptId, fullname, surveyType, participant, project } = req.body;
    await db.runTransaction(async t => {
      const reaserchersPoints = {};
      const trabscriptionRef = db.collection("transcript").doc(transcriptId);
      const transcriptDoc = await t.get(trabscriptionRef);
      const transcriptData = transcriptDoc.data();
      const themathicDocs = await t.get(db.collection("thematicAnalysis").where("transcriptId", "==", transcriptId));
      const reaserchers = {};
      const reaserchersDocs = await t.get(db.collection("researchers"));
      const thematicDocs = await t.get(
        db.collection("thematicAnalysis").where("transcriptId", "==", transcriptId).where("researcher", "==", fullname)
      );
      reaserchersDocs.docs.forEach(doc => {
        if (doc.data().projects && doc.data().projects.hasOwnProperty(project)) {
          reaserchers[doc.id] = doc.data();
        }
      });
      for (let doc of themathicDocs.docs) {
        const data = doc.data();
        const selectedCodes = [...new Set(Object.values(doc.data().codesBook).flatMap(x => x))];
        selectedCodes.forEach(code => {
          if (reaserchersPoints.hasOwnProperty(code)) {
            reaserchersPoints[code].push(data.researcher);
          } else {
            reaserchersPoints[code] = [data.researcher];
          }
        });
        if (data.researcher in reaserchersPoints) {
          reaserchersPoints[data.researcher] += 1;
        } else {
          reaserchersPoints[data.researcher] = 1;
        }
      }
      const selectedCodes = [...new Set(Object.values(codesBook).flatMap(x => x))];
      selectedCodes.forEach(code => {
        if (reaserchersPoints.hasOwnProperty(code)) {
          reaserchersPoints[code].push(fullname);
        } else {
          reaserchersPoints[code] = [fullname];
        }
      });
      for (let code in reaserchersPoints) {
        if (reaserchersPoints[code].length >= 3) {
          for (let researcher of reaserchersPoints[code]) {
            const resRef = db.collection("researchers").doc(researcher);
            reaserchers[researcher].projects[project].positiveCodingPoints += 0.4;
            t.update(resRef, reaserchers[researcher]);
          }
        }
      }
      if (!transcriptData.hasOwnProperty("coders") || !transcriptData.coders.includes(fullname)) {
        if (reaserchers[fullname].projects[project].hasOwnProperty("codingNum")) {
          reaserchers[fullname].projects[project].codingNum += 1;
        } else {
          reaserchers[fullname].projects[project].codingNum = 1;
        }
      }
      if (thematicDocs.docs.length > 0) {
        t.update(thematicDocs.docs[0].ref, {
          codesBook: codesBook,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        const ref = db.collection("thematicAnalysis").doc();
        t.set(ref, {
          project,
          codesBook: codesBook,
          transcriptId,
          researcher: fullname,
          createdAt: Timestamp.fromDate(new Date()),
          surveyType,
          participant
        });
      }

      t.update(trabscriptionRef, {
        coders: FieldValue.arrayUnion(fullname)
      });
    });
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};

exports.updatePhraseForPassage = async (req, res) => {
  try {
    const { passagTitle, selectedPhrase, newPhrase, resetGrades } = req.body;
    const passageQuery = db.collection("passages").where("title", "==", passagTitle);
    const passageSnapshot = await passageQuery.get();
    const passageDoc = passageSnapshot.docs[0];
    const passageUpdate = { ...passageDoc.data() };
    passageUpdate.phrases[passageUpdate.phrases.indexOf(selectedPhrase)] = newPhrase;
    const updateTasks = [];

    updateTasks.push(
      passageDoc.ref.update({
        phrases: passageUpdate.phrases
      })
    );
    const recallsDocs = await db.collection("recallGradesV2").where("passages", "array-contains", passageDoc.id).get();
    const booleanExpressionsDocs = await db.collection("booleanScratch").where("phrase", "==", selectedPhrase).get();
    console.log("got the recall query");
    for (let recallDoc of recallsDocs.docs) {
      const recallData = recallDoc.data();
      let sessions = recallData.sessions;
      let needUpdate = false;

      for (let session in sessions) {
        for (let conditionItem of sessions[session]) {
          for (let phraseItem of conditionItem.phrases) {
            if (phraseItem.phrase === selectedPhrase) {
              needUpdate = true;
              phraseItem.phrase = newPhrase;
              if (resetGrades) {
                conditionItem.done = false;
                conditionItem.reaserchers = [];
                phraseItem.researchers = [];
                phraseItem.grades = [];
                for (let key of Object.keys(phraseItem)) {
                  if (!["phrase", "researchers", "grades"].includes(key)) {
                    delete phraseItem[key];
                  }
                }
              }
            }
          }
        }
      }
      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions }));
      }
    }
    for (let booleanDoc of booleanExpressionsDocs.docs) {
      updateTasks.push(booleanDoc.ref.update({ phrase: newPhrase }));
    }
    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};

exports.addNewPhraseForPassage = async (req, res) => {
  try {
    const { chosenPassage, newPhraseAdded } = req.body;
    const passageDocs = await db.collection("passages").where("title", "==", chosenPassage).get();
    const passageDoc = passageDocs.docs[0];
    const recallDocs = await db.collection("recallGradesV2").where("passages", "array-contains", passageDoc.id).get();
    const updateTasks = [];
    updateTasks.push(
      passageDoc.ref.update({
        phrases: FieldValue.arrayUnion(newPhraseAdded)
      })
    );
    for (const recallDoc of recallDocs.docs) {
      const recallData = recallDoc.data();
      let needUpdate = false;

      for (const session in recallData.sessions) {
        for (const conditionItem of recallData.sessions[session]) {
          if (conditionItem.passage === passageDoc.id) {
            conditionItem.reaserchers = [];
            conditionItem.phrases.push({ phrase: newPhraseAdded, researchers: [], grades: [] });
            needUpdate = true;
          }
        }
      }

      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions: recallData.sessions }));
      }
    }

    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: "error" });
    console.log(error);
  }
};

exports.calcultesRecallGradesRecords = async (req, res) => {
  try {
    const { passageId, selectedPhrase } = req.body;
    const recallGradesDoc = await db.collection("recallGradesV2").where("passages", "array-contains", passageId).get();
    let numberRecord = 0;
    for (let recallDoc of recallGradesDoc.docs) {
      const recallData = recallDoc.data();
      let sessions = recallData.sessions;
      for (let session in sessions) {
        for (let conditionItem of sessions[session]) {
          if (conditionItem.passage === passageId) {
            const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
            if (phraseIndex !== -1 && conditionItem.phrases[phraseIndex].hasOwnProperty("researchers")) {
              console.log("researchers", conditionItem.phrases[phraseIndex].researchers);
            }
            if (
              phraseIndex !== -1 &&
              conditionItem.phrases[phraseIndex].hasOwnProperty("researchers") &&
              conditionItem.phrases[phraseIndex].researchers.length > 0
            ) {
              numberRecord = numberRecord + 1;
            }
          }
        }
      }
    }
    return res.status(200).send({ numberRecord });
  } catch {
    return res.status(500).send({ message: "error" });
  }
};

exports.deletePhraseFromPassage = async (req, res) => {
  try {
    const { passageId, selectedPhrase } = req.body;
    const passageRef = db.collection("passages").doc(passageId);
    const recallGradesDoc = await db.collection("recallGradesV2").where("passages", "array-contains", passageId).get();
    const passageDoc = await passageRef.get();
    const passageData = passageDoc.data();
    if (passageData.hasOwnProperty("phrasesTypes")) {
      passageData.phrasesTypes.splice(passageData.phrases.indexOf(selectedPhrase), 1);
    }
    const updateTasks = [];
    updateTasks.push(
      passageDoc.ref.update({
        phrases: FieldValue.arrayRemove(selectedPhrase),
        phrasesTypes: passageData.hasOwnProperty("phrasesTypes") ? passageData.phrasesTypes : []
      })
    );

    for (let recallDoc of recallGradesDoc.docs) {
      let updateSessions = recallDoc.data().sessions;
      let needUpdate = false;
      for (let session in updateSessions) {
        for (let conditionItem of updateSessions[session]) {
          const phraseIndex = conditionItem.phrases.findIndex(p => p.phrase === selectedPhrase);
          if (conditionItem.passage === passageId && phraseIndex !== -1) {
            needUpdate = true;
            conditionItem.phrases[phraseIndex].deleted = true;
          }
        }
      }
      if (needUpdate) {
        updateTasks.push(recallDoc.ref.update({ sessions: updateSessions }));
      }
    }
    await Promise.all(updateTasks);
    res.status(200).send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "error" });
  }
};

exports.loadRecallGradesNumbers = async (req, res) => {
  try {
    console.log("loadRecallGradesNumbers");
    let noMajority = [];
    let majorityDifferentThanBot = [];
    const gptResearcher = "Iman YeckehZaare";
    //records that the bot should grade (remaining ) : their boolean expressions are satisfied and less than 2  researchers graded them
    let countGraded = 0;
    //number of records it's already graded : their boolean expressions are satisfied and  less than 2 researchers graded them
    let notGrades = 0;
    // # of phrases that the bot has graded and their boolean expressions are not satisfied
    let countNSatisfiedGraded = 0;
    //# of phrases that the bot has graded and their boolean expressions are satisfied and 2 or more researchers graded them
    let countSatifiedGraded = 0;
    //# of phrases that their boolean expressions are not satisfied
    let notSatisfied = 0;
    //# of phrases that their boolean expressions are satisfied and 2 or more researchers graded them
    let satisfiedThreeRes = 0;

    //Total # of phrases
    let countPairPhrases = 0;
    const passagesHash = {};
    const passageDocs = await db.collection("passages").get();
    passageDocs.forEach(passageDoc => {
      passagesHash[passageDoc.id] = passageDoc.data().text;
    });
    const recallGradesDocs = await db.collection("recallGradesV2").get();
    for (let recallDoc of recallGradesDocs.docs) {
      const recallData = recallDoc.data();

      for (let session in recallData.sessions) {
        for (let conditionItem of recallData.sessions[session]) {
          const conditionIndex = recallData.sessions[session].indexOf(conditionItem);
          for (let phraseItem of conditionItem.phrases) {
            const phraseIndex = conditionItem.phrases.indexOf(phraseItem);
            countPairPhrases++;
            const researcherIdx = phraseItem.researchers.indexOf(gptResearcher);
            let otherResearchers = phraseItem.researchers.slice();
            let otherGrades = phraseItem.grades.slice();
            if (researcherIdx !== -1) {
              otherResearchers.splice(researcherIdx, 1);
              otherGrades.splice(researcherIdx, 1);
            }
            const trueVotes = otherGrades.filter(grade => grade).length;
            const falseVotes = otherGrades.filter(grade => !grade).length;
            if (!phraseItem.hasOwnProperty("GPT4-jun") && phraseItem.satisfied && otherResearchers.length <= 2) {
              notGrades++;
            }
            if (phraseItem.hasOwnProperty("GPT4-jun") && phraseItem.satisfied && otherResearchers.length <= 2) {
              countGraded++;
            }

            if (phraseItem.hasOwnProperty("GPT4-jun") && !phraseItem.satisfied) {
              countNSatisfiedGraded++;
            }
            if (
              phraseItem.hasOwnProperty("GPT4-jun") &&
              phraseItem.satisfied /* &&
              otherResearchers.length >= 2 */
            ) {
              countSatifiedGraded++;
            }
            if (!phraseItem.satisfied) {
              notSatisfied++;
            }
            if (otherResearchers.length >= 2 && phraseItem.satisfied) {
              satisfiedThreeRes++;
            }
            const botGrade = phraseItem.hasOwnProperty("GPT4-jun") ? phraseItem["GPT4-jun"] : null;
            if (!phraseItem.hasOwnProperty("majority") && phraseItem.hasOwnProperty("GPT4-jun")) {
              if ((trueVotes >= 3 && !botGrade) || (falseVotes >= 3 && botGrade)) {
                majorityDifferentThanBot.push({
                  ...phraseItem,
                  botGrade,
                  grades: otherGrades,
                  Response: conditionItem.response,
                  session: session,
                  condition: conditionIndex,
                  id: recallDoc.id,
                  originalPassgae: passagesHash[conditionItem.passage],
                  phraseIndex
                });
              }
            }
            if (!phraseItem.hasOwnProperty("majority") && trueVotes === falseVotes && otherGrades.length >= 4) {
              noMajority.push({
                ...phraseItem,
                botGrade,
                grades: otherGrades,
                Response: conditionItem.response,
                session: session,
                condition: conditionIndex,
                id: recallDoc.id,
                originalPassgae: passagesHash[conditionItem.passage],
                phraseIndex
              });
            }
          }
        }
      }
    }

    noMajority = noMajority.filter(gradeMajority => gradeMajority.grades.length !== 0);
    majorityDifferentThanBot = majorityDifferentThanBot.filter(gradeMajority => gradeMajority.grades.length !== 0);

    return res.status(200).send({
      noMajority,
      majorityDifferentThanBot,
      notGrades,
      countGraded,
      countNSatisfiedGraded,
      countSatifiedGraded,
      notSatisfied,
      satisfiedThreeRes,
      countPairPhrases
    });
  } catch (error) {
    console.log(error);
  }
};
