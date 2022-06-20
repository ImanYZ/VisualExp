const fs = require("fs");
const csv = require("fast-csv");

const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin");
const { allPastEvents, futureEvents, pastEvents } = require("./scheduling");
const {
  isToday,
  strToBoolean,
  getActivityTimeStamps,
  getIn30Minutes,
  getDateString,
} = require("./utils");
const {
  reschEventNotificationEmail,
  researcherEventNotificationEmail,
  eventNotificationEmail,
  notAttendedEmail,
  remindResearcherToSpecifyAvailability,
} = require("./emailing");
const { deleteEvent } = require("./GoogleCalendar");

const researchers = [
  { fullname: "Jessica Cai", email: "jc126@iu.edu" },
  { fullname: "Pritha Gangapur", email: "gangapu1@msu.edu" },
  { fullname: "Shabana Gupta", email: "shabanagupta11@gmail.com" },
  { fullname: "Winnifer Chen", email: "winnifer@umich.edu" },
  { fullname: "Zoe Dunnum", email: "dunnumzoe@gmail.com" },
  { fullname: "Yi Cui", email: "chloecui@umich.edu" },
  { fullname: "Jasmine Wu", email: "jasminewu56@gmail.com" },
  { fullname: "Rani Kang", email: "qk2003@nyu.edu" },
  { fullname: "Molly Kraine", email: "krainem@umich.edu" },
];

const voteFn = async (voter, activity, vote) => {
  try {
    const currentTime = admin.firestore.Timestamp.fromDate(new Date());
    await db.runTransaction(async (t) => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const activityRef = db.collection("activities").doc(activity);
      const activityDoc = await t.get(activityRef);
      if (activityDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const activityData = activityDoc.data();
        const researcherRef = db
          .collection("researchers")
          .doc(activityData.fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
        const voteQuery = db
          .collection("votes")
          .where("activity", "==", activity)
          .where("voter", "==", voter)
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
            updatedAt: currentTime,
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
            createdAt: currentTime,
          };
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("voteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id,
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
              noVotes: noVotes + noVoteVal,
            },
          },
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id,
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
              points: points + upVoteVal,
            },
          },
        };
        t.update(researcherRef, researcherProjectUpdates);
        const researcherLogRef = db.collection("researcherLogs").doc();
        t.set(researcherLogRef, {
          ...researcherProjectUpdates,
          updatedAt: currentTime,
          id: researcherRef.id,
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
          noVotes: activityNoVotes + noVoteVal,
        };
        t.update(activityRef, activityUpdates);
        const activityLogRef = db.collection("activityLogs").doc();
        t.set(activityLogRef, {
          id: activityRef.id,
          updatedAt: currentTime,
          ...activityUpdates,
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
      const authUser = await admin
        .auth()
        .verifyIdToken(req.headers.authorization);
      const userDocs = await db
        .collection("users")
        .where("uid", "==", authUser.uid)
        .limit(1)
        .get();
      if (userDocs.docs.length > 0) {
        await voteFn(userDocs.docs[0].id, activity, vote);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};

exports.voteActivityReset = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin
        .auth()
        .verifyIdToken(req.headers.authorization);
      const userDocs = await db
        .collection("users")
        .where("uid", "==", authUser.uid)
        .limit(1)
        .get();
      if (userDocs.docs.length > 0) {
        const currentTime = admin.firestore.Timestamp.fromDate(new Date());
        await db.runTransaction(async (t) => {
          const activityRef = db.collection("activities").doc(activity);
          const activityDoc = await t.get(activityRef);
          if (activityDoc.exists) {
            const voteQuery = db
              .collection("votes")
              .where("activity", "==", activity);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("votes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                noVote: false,
                updatedAt: currentTime,
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("voteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id,
              });
            }
            const activityUpdates = {
              upVotes: 0,
              noVotes: 0,
            };
            t.update(activityRef, activityUpdates);
            const activityLogRef = db.collection("activityLogs").doc();
            t.set(activityLogRef, {
              id: activityRef.id,
              updatedAt: currentTime,
              ...activityUpdates,
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = req.body.activity;
    if (activity) {
      const authUser = await admin
        .auth()
        .verifyIdToken(req.headers.authorization);
      try {
        const currentTime = admin.firestore.Timestamp.fromDate(new Date());
        await db.runTransaction(async (t) => {
          const userQuery = db
            .collection("users")
            .where("uid", "==", authUser.uid)
            .limit(1);
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
              const votesQuery = db
                .collection("votes")
                .where("activity", "==", activity);
              const voteDocs = await t.get(votesQuery);
              const voteRefsToDelete = [];
              const voterUpdates = [];
              for (const voteDoc of voteDocs.docs) {
                const voteRef = db.collection("votes").doc(voteDoc.id);
                voteRefsToDelete.push(voteRef);
                const voteData = voteDoc.data();
                const voterRef = db
                  .collection("researchers")
                  .doc(voteData.voter);
                const voterDoc = await t.get(voterRef);
                const voterData = voterDoc.data();
                const voterUpdateData = {
                  projects: voterData.projects,
                };
                if (voteData.upVote) {
                  voterUpdateData.projects[voteData.project].upVotes -= 1;
                } else if (voteData.noVote) {
                  voterUpdateData.projects[voteData.project].noVotes -= 1;
                }
                voterUpdates.push({
                  voterRef,
                  voterUpdateData,
                });
              }
              for (let voteRefToDelete of voteRefsToDelete) {
                const voteLogRef = db.collection("voteLogs").doc();
                t.set(voteLogRef, {
                  id: voteRefToDelete.id,
                  deleted: true,
                });
                t.delete(voteRefToDelete);
              }
              for (let voterUpdate of voterUpdates) {
                t.update(voterUpdate.voterRef, voterUpdate.voterUpdateData);
                const voterLogRef = db.collection("researcherLogs").doc();
                t.set(voterLogRef, {
                  id: voterUpdate.voterRef.id,
                  ...voterUpdate.voterUpdateData,
                });
              }
              const pointsUpdate = {
                projects: {
                  ...researcherData.projects,
                  [activityData.project]: {
                    ...researcherData.projects[activityData.project],
                    points:
                      researcherData.projects[activityData.project].points -
                      activityData.upVotes,
                  },
                },
              };
              t.update(researcherRef, pointsUpdate);
              const researcherLogRef = db.collection("researcherLogs").doc();
              t.set(researcherLogRef, {
                id: researcherRef.id,
                ...pointsUpdate,
              });
              const activityLogRef = db.collection("activityLogs").doc();
              t.set(activityLogRef, {
                id: activityRef.id,
                deleted: true,
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
    return res.status(500).json({ err });
  }
};

const voteInstructorFn = async (voter, instructor, vote, comment) => {
  try {
    const currentTime = admin.firestore.Timestamp.fromDate(new Date());
    await db.runTransaction(async (t) => {
      const voterRef = db.collection("researchers").doc(voter);
      const voterDoc = await t.get(voterRef);
      const instructorRef = db.collection("instructors").doc(instructor);
      const instructorDoc = await t.get(instructorRef);
      if (instructorDoc.exists && voterDoc.exists) {
        const voterData = voterDoc.data();
        const instructorData = instructorDoc.data();
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
            updatedAt: currentTime,
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
            project: instructorData.project,
            upVote: newUpVote,
            downVote: newDownVote,
            voter,
            createdAt: currentTime,
          };
          if (comment) {
            newVoteData.comment = comment;
          }
          t.set(voteRef, newVoteData);
        }
        const voteLogRef = db.collection("instructorVoteLogs").doc();
        t.set(voteLogRef, {
          ...newVoteData,
          id: voteRef.id,
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
        if (voterData.projects[instructorData.project].instructorUpVotes) {
          upVotes =
            voterData.projects[instructorData.project].instructorUpVotes;
        }
        let downVotes = 0;
        if (voterData.projects[instructorData.project].instructorDownVotes) {
          downVotes =
            voterData.projects[instructorData.project].instructorDownVotes;
        }
        const voterProjectUpdates = {
          projects: {
            ...voterData.projects,
            [instructorData.project]: {
              ...voterData.projects[instructorData.project],
              instructorUpVotes: upVotes + upVoteVal,
              instructorDownVotes: downVotes + downVoteVal,
            },
          },
        };
        t.update(voterRef, voterProjectUpdates);
        const voterLogRef = db.collection("researcherLogs").doc();
        t.set(voterLogRef, {
          ...voterProjectUpdates,
          updatedAt: currentTime,
          id: voterRef.id,
        });
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
          downVotes: instructorDownVotes + downVoteVal,
        };
        if (comment) {
          if (!("comments" in instructorData)) {
            instructorUpdates.comments = [comment];
          } else if (voteData && voteData.comment !== comment) {
            instructorUpdates.comments = instructorData.comments.filter(
              (comm) => comm !== voteData.comment
            );
            instructorUpdates.comments.push(comment);
          }
        }
        t.update(instructorRef, instructorUpdates);
        const instructorLogRef = db.collection("instructorLogs").doc();
        t.set(instructorLogRef, {
          id: instructorRef.id,
          updatedAt: currentTime,
          ...instructorUpdates,
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
    const comment = req.body.comment;
    if (instructor && vote) {
      const authUser = await admin
        .auth()
        .verifyIdToken(req.headers.authorization);
      const userDocs = await db
        .collection("users")
        .where("uid", "==", authUser.uid)
        .limit(1)
        .get();
      if (userDocs.docs.length > 0) {
        await voteInstructorFn(userDocs.docs[0].id, instructor, vote, comment);
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};

exports.voteInstructorReset = async (req, res) => {
  try {
    const instructor = req.body.instructor;
    if (instructor) {
      const authUser = await admin
        .auth()
        .verifyIdToken(req.headers.authorization);
      const userDocs = await db
        .collection("users")
        .where("uid", "==", authUser.uid)
        .limit(1)
        .get();
      if (userDocs.docs.length > 0) {
        const currentTime = admin.firestore.Timestamp.fromDate(new Date());
        await db.runTransaction(async (t) => {
          const instructorRef = db.collection("instructors").doc(instructor);
          const instructorDoc = await t.get(instructorRef);
          if (instructorDoc.exists) {
            const voteQuery = db
              .collection("instructorVotes")
              .where("instructor", "==", instructor);
            const voteDocs = await t.get(voteQuery);
            for (let voteDoc of voteDocs.docs) {
              const voteRef = db.collection("instructorVotes").doc(voteDoc.id);
              const newVoteData = {
                upVote: false,
                downVote: false,
                updatedAt: currentTime,
              };
              t.update(voteRef, newVoteData);
              const voteLogRef = db.collection("instructorVoteLogs").doc();
              t.set(voteLogRef, {
                ...newVoteData,
                id: voteRef.id,
              });
            }
            const instructorUpdates = {
              upVotes: 0,
              downVotes: 0,
            };
            t.update(instructorRef, instructorUpdates);
            const instructorLogRef = db.collection("instructorLogs").doc();
            t.set(instructorLogRef, {
              id: instructorRef.id,
              updatedAt: currentTime,
              ...instructorUpdates,
            });
          }
        });
      }
    }
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};

// exports.addInstructorsNums = async (req, res) => {
//   try {
//     const instructorsNums = {};
//     const instructorDocs = await db.collection("instructors").get();
//     for (let instructorDoc of instructorDocs.docs) {
//       const instructorData = instructorDoc.data();
//       if (instructorData.fullname in instructorsNums) {
//         instructorsNums[instructorData.fullname].num += 1;
//       } else {
//         instructorsNums[instructorData.fullname] = {
//           project: instructorData.project,
//           num: 1,
//         };
//       }
//     }
//     for (let fullname in instructorsNums) {
//       const researcherRef = db.collection("researchers").doc(fullname);
//       const researcherDoc = await researcherRef.get();
//       const researcherData = researcherDoc.data();
//       const projectData =
//         researcherData.projects[[instructorsNums[fullname].project]];
//       await batchUpdate(researcherRef, {
//         projects: {
//           ...researcherData.projects,
//           [instructorsNums[fullname].project]: {
//             ...projectData,
//             instructorsNum: instructorsNums[fullname].num,
//           },
//         },
//       });
//     }
//     await commitBatch();
//     return res.status(200).json({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ err });
//   }
// };

// const codeFeedback = async (
//   coder,
//   code,
//   status,
//   project,
//   fullname,
//   session,
//   expIdx
// ) => {
//   try {
//     const currentTime = admin.firestore.Timestamp.fromDate(new Date());
//     await db.runTransaction(async (t) => {
//       const coderRef = db.collection("researchers").doc(coder);
//       const coderDoc = await t.get(coderRef);
//       const coderData = coderDoc.data();
//       const userRef = db.collection("users").doc(fullname);
//       const userDoc = await t.get(userRef);
//       const userData = userDoc.data();
//       const feedbackCodeBookDoc = await db
//         .collection("feedbackCodeBooks")
//         .doc(code)
//         .get();
//       const feedbackCodeDocs = await db
//         .collection("feedbackCodes")
//         .where("coder", "==", coder)
//         .where("code", "==", code)
//         .where("project", "==", project)
//         .where("fullname", "==", fullname)
//         .where("session", "==", session)
//         .where("expIdx", "==", expIdx)
//         .get();
//       const sameCodeDocs = await db
//         .collection("feedbackCodes")
//         .where("code", "==", code)
//         .where("project", "==", project)
//         .where("fullname", "==", fullname)
//         .where("session", "==", session)
//         .where("expIdx", "==", expIdx)
//         .get();
//       const approvedCodeDocs = await db
//         .collection("approvedFeedbackCodes")
//         .where("code", "==", code)
//         .where("project", "==", project)
//         .where("fullname", "==", fullname)
//         .where("session", "==", session)
//         .where("expIdx", "==", expIdx)
//         .get();
//       let explanation;
//       switch (session) {
//         case 1:
//           if ("explanations" in userData && userData.explanations[expIdx]) {
//             explanation = userData.explanations[expIdx];
//           }
//           break;
//         case 2:
//           if (
//             "explanations3Days" in userData &&
//             userData.explanations3Days[expIdx]
//           ) {
//             explanation = userData.explanations3Days[expIdx];
//           }
//           break;
//         case 3:
//           if (
//             "explanations1Week" in userData &&
//             userData.explanations1Week[expIdx]
//           ) {
//             explanation = userData.explanations1Week[expIdx];
//           }
//           break;
//         default:
//           console.log("Invalid session number: " + session);
//           throw "Invalid session number: " + session;
//       }
//       if (explanation) {
//         if (feedbackCodeDocs.docs.length > 0) {
//           const feedbackCodeRef = db
//             .collection("feedbackCodes")
//             .doc(feedbackCodeDocs.docs[0].id);
//           t.update(feedbackCodeRef, {
//             status,
//             updatedAt: currentTime,
//           });
//         } else {
//           const feedbackCodeRef = db.collection("feedbackCodes").doc();
//           t.set(feedbackCodeRef, {
//             coder,
//             code,
//             status,
//             project,
//             fullname,
//             session,
//             expIdx,
//             explanation,
//             createdAt: currentTime,
//           });
//         }
//         if (!feedbackCodeBookDoc.exists) {
//           const feedbackCodeBookRef = db
//             .collection("feedbackCodeBooks")
//             .doc(code);
//           t.set(feedbackCodeBookRef, {
//             code,
//             coder,
//             createdAt: currentTime,
//           });
//         }
//         if (status) {
//           if (sameCodeDocs.docs.length >= 2) {
//             const otherCoders = [];
//             for (let sameCodeDoc of sameCodeDocs.docs) {
//               if (sameCodeDoc.coder !== coder) {
//                 otherCoders.push(sameCodeDoc.coder);
//               }
//             }
//             if (
//               otherCoders.length === 2 &&
//               approvedCodeDocs.docs.length === 0
//             ) {
//               const approvedCodeRef = db
//                 .collection("approvedFeedbackCodes")
//                 .doc();
//               t.set(approvedCodeRef, {
//                 code,
//                 coders: [coder, ...otherCoders],
//                 project,
//                 fullname,
//                 session,
//                 expIdx,
//                 createdAt: currentTime,
//               });
//               for (let sameCodeDoc of sameCodeDocs.docs) {
//                 const sameCodeData = sameCodeDoc.data();
//                 let feedbackCodePoints = 0;
//                 if (coderData.projects[project].feedbackCodePoints) {
//                   feedbackCodePoints =
//                     coderData.projects[project].feedbackCodePoints;
//                 }
//                 t.update(coderRef, {
//                   projects: {
//                     ...coderData.projects,
//                     [project]: {
//                       ...coderData.projects[project],
//                       feedbackCodePoints: feedbackCodePoints + 1,
//                     },
//                   },
//                 });
//               }
//             }
//           }
//         } else {
//           if (
//             sameCodeDocs.docs.length === 3 &&
//             approvedCodeDocs.docs.length > 0
//           ) {
//           }
//         }
//       }
//     });
//   } catch (e) {
//     console.log("Transaction failure:", e);
//   }
// };

// exports.codeFeedbackEndpoint = async (req, res) => {
//   try {
//     const activity = req.body.activity;
//     const vote = req.body.vote;
//     if (activity && vote) {
//       const authUser = await admin
//         .auth()
//         .verifyIdToken(req.headers.authorization);
//       const userDocs = await db
//         .collection("users")
//         .where("uid", "==", authUser.uid)
//         .limit(1)
//         .get();
//       if (userDocs.docs.length > 0) {
//         await voteFn(userDocs.docs[0].id, activity, vote);
//       }
//     }
//     return res.status(200).json({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ err });
//   }
// };

// // Load the existing codes for qualitative feedback from the CSV files to the
// // database, fill in the feedbackCodeBooks and feedbackCodes collections and
// // assign points to these old researchers in researchers.
// // The pseudocode is illustrated in
// exports.loadfeedbackCodes = async (req, res) => {
//   try {
//     // The issue with our CSV files is that we do not have the users'
//     // identifiers. So, we need to retrieve all the users, then for each
//     // explanations, we should check which user it belongs to and get the index
//     // of that user to continue with.
//     let userDocs = await db.collection("users").get();
//     const usersData = {};
//     for (let userDoc of userDocs.docs) {
//       usersData[userDoc.id] = userDoc.data();
//     }

//     // Because the CSV files are specific to a question from a session, coder,
//     // and project, before opening each, we should specify the following
//     // parameter names that the CSV file is associated with.
//     const project = "H2K2";
//     const coders = ["Zoe Dunnum", "Jasmine Wu", "Shabana Gupta"];
//     const expParameters = [
//       // {
//       //   expIdx: 0,
//       //   columnName: "explanation1",
//       //   session: "1st",
//       //   fieldName: "explanations",
//       //   choiceField: "postQ1Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q1 Phase 1.csv",
//       // },
//       // {
//       //   expIdx: 0,
//       //   columnName: "explanation2",
//       //   session: "2nd",
//       //   fieldName: "explanations3Days",
//       //   choiceField: "post3DaysQ1Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q1 Phase 2.csv",
//       // },
//       // {
//       //   expIdx: 1,
//       //   columnName: "explanation2",
//       //   session: "1st",
//       //   fieldName: "explanations",
//       //   choiceField: "postQ2Choice",
//       //   filePath: "datasets/Experiment Data - Copy of Coding Q2 Phase 1.csv",
//       // },
//       {
//         expIdx: 1,
//         columnName: "explanation2-3Days",
//         session: "2nd",
//         fieldName: "explanations3Days",
//         choiceField: "post3DaysQ2Choice",
//         filePath: "datasets/Experiment Data - Copy of Coding Q2 Phase 2.csv",
//       },
//     ];
//     for (let {
//       expIdx,
//       columnName,
//       session,
//       fieldName,
//       choiceField,
//       filePath,
//     } of expParameters) {
//       const ws = fs.createReadStream(filePath);
//       let rowIdx = 0;
//       const parser = csv
//         .parseStream(ws, { headers: true })
//         .on("error", (error) => {
//           console.error(error);
//           return res.status(500).json({ error });
//         })
//         .on("data", async (row) => {
//           console.log(rowIdx);
//           // We need to pause reading from the CSV file to process the row
//           // before continuing with the next row.
//           parser.pause();
//           if (row[columnName]) {
//             let explanation = row[columnName].replace(/(\r\n|\n|\r|[ ])/gm, "");
//             // We should iterate through all the users to figure out which user this
//             // explanation belongs to and identify their fullname.
//             let fullname = "";
//             for (let userId in usersData) {
//               if (
//                 fieldName in usersData[userId] &&
//                 usersData[userId][fieldName]
//               ) {
//                 if (
//                   usersData[userId][fieldName][expIdx].replace(
//                     /(\r\n|\n|\r|[ ])/gm,
//                     ""
//                   ) === explanation
//                 ) {
//                   fullname = userId;
//                   break;
//                 }
//               }
//             }
//             if (fullname === "") {
//               console.log({ explanation: row[columnName] });
//             } else {
//               explanation = usersData[fullname][fieldName][expIdx];
//               const choice = usersData[fullname][choiceField];
//               await db.runTransaction(async (t) => {
//                 // Accumulate all the transaction writes in an array to commit all of them
//                 // after all the reads to abide by the Firestore transaction law
//                 // https://firebase.google.com/docs/firestore/manage-data/transactions#transactions.
//                 const transactionWrites = [];
//                 const currentTime = admin.firestore.Timestamp.fromDate(
//                   new Date()
//                 );
//                 // We have two coders (researchers) and we need to do the rest for
//                 // each of the two coders.
//                 for (let coder of coders) {
//                   const researcherRef = db.collection("researchers").doc(coder);
//                   const researcherDoc = await t.get(researcherRef);
//                   const researcherData = researcherDoc.data();
//                   const researcherUpdates = {
//                     projects: {
//                       ...researcherData.projects,
//                       [project]: {
//                         ...researcherData.projects[project],
//                       },
//                     },
//                   };
//                   for (let code in row) {
//                     if (
//                       ![
//                         "UserIndex",
//                         "postQ1Choice",
//                         "explanation1",
//                         "explanation2",
//                         "fullname",
//                         "postQ2Choice",
//                         "postQ2Choice-3Days",
//                         "explanation2-3Days",
//                       ].includes(code) &&
//                       !["", "0", 0].includes(row[code])
//                     ) {
//                       const feedbackCodeBookQuery = db
//                         .collection("feedbackCodeBooks")
//                         .where("code", "==", code);
//                       const feedbackCodeBookDocs = await t.get(
//                         feedbackCodeBookQuery
//                       );
//                       if (feedbackCodeBookDocs.docs.length === 0) {
//                         const feedbackCodeBookRef = db
//                           .collection("feedbackCodeBooks")
//                           .doc();
//                         transactionWrites.push({
//                           type: "set",
//                           objRef: feedbackCodeBookRef,
//                           obj: {
//                             code,
//                             coder,
//                             createdAt: currentTime,
//                           },
//                         });
//                         if (
//                           "codesGenerated" in
//                           researcherUpdates.projects[project]
//                         ) {
//                           researcherUpdates.projects[
//                             project
//                           ].codesGenerated += 1;
//                         } else {
//                           researcherUpdates.projects[
//                             project
//                           ].codesGenerated = 1;
//                         }
//                       }
//                       if ("codesNum" in researcherUpdates.projects[project]) {
//                         researcherUpdates.projects[project].codesNum += 1;
//                       } else {
//                         researcherUpdates.projects[project].codesNum = 1;
//                       }
//                       const feedbackCodeQuery = db
//                         .collection("feedbackCodes")
//                         .where("explanation", "==", explanation)
//                         .where("code", "==", code)
//                         .where("choice", "==", choice)
//                         .where("expIdx", "==", expIdx)
//                         .where("session", "==", session);
//                       const feedbackCodeDocs = await t.get(feedbackCodeQuery);
//                       let approved = false;
//                       if (feedbackCodeDocs.docs.length >= 2) {
//                         approved = true;
//                         if (
//                           "codesPoints" in researcherUpdates.projects[project]
//                         ) {
//                           researcherUpdates.projects[project].codesPoints += 1;
//                         } else {
//                           researcherUpdates.projects[project].codesPoints = 1;
//                         }
//                       }
//                       const feedbackCodeRef = db
//                         .collection("feedbackCodes")
//                         .doc();
//                       transactionWrites.push({
//                         type: "set",
//                         objRef: feedbackCodeRef,
//                         obj: {
//                           coder,
//                           code,
//                           choice,
//                           approved,
//                           project,
//                           fullname,
//                           session,
//                           expIdx,
//                           explanation,
//                           quotes: [],
//                           createdAt: currentTime,
//                         },
//                       });
//                     }
//                   }
//                   transactionWrites.push({
//                     type: "update",
//                     objRef: researcherRef,
//                     obj: researcherUpdates,
//                   });
//                 }
//                 for (let transWrite of transactionWrites) {
//                   if (transWrite.type === "set") {
//                     t.set(transWrite.objRef, transWrite.obj);
//                   } else if (transWrite.type === "update") {
//                     t.update(transWrite.objRef, transWrite.obj);
//                   }
//                 }
//               });
//             }
//           }
//           rowIdx += 1;
//           parser.resume();
//         })
//         .on("end", async (row) => {});
//     }
//   } catch (err) {
//     console.log({ err });
//     return res.status(500).json({ err });
//   }
//   return res.status(500).json({ done: true });
// };

exports.loadTimesheetVotes = async (req, res) => {
  try {
    const project = "H2K2";
    let researcherIdx = 0;
    let preResearcherIdx = -1;
    const researcherInterval = setInterval(() => {
      if (researcherIdx < researchers.length) {
        if (preResearcherIdx !== researcherIdx) {
          preResearcherIdx = researcherIdx;
          const fullname = researchers[researcherIdx].fullname;
          let rowIdx = 0;
          const ws = fs.createReadStream(
            "datasets/Linear, Hybrid, or Non-linear Knowledge RCT - " +
              fullname +
              ".csv"
          );
          const parser = csv
            .parseStream(ws, { headers: true })
            .on("error", (error) => {
              console.error(error);
              return res.status(500).json({ error });
            })
            .on("data", async (row) => {
              console.log(rowIdx);
              parser.pause();
              if (row["Date"] && row["Time In"] && row["Time Out"]) {
                const activityDate = new Date(row["Date"]);
                const startTime = new Date(
                  row["Date"] + " " + row["Time In"] + ":00"
                );
                const endTime = new Date(
                  row["Date"] + " " + row["Time Out"] + ":00"
                );
                const timeStamps = getIn30Minutes(startTime, endTime);
                for (let { sTime, eTime } of timeStamps) {
                  const { sTimestamp, eTimestamp } = getActivityTimeStamps(
                    activityDate,
                    sTime,
                    eTime
                  );
                  const currentTime = admin.firestore.Timestamp.fromDate(
                    new Date()
                  );
                  const activityRef = db.collection("activities").doc();
                  const docObj = {
                    fullname,
                    project,
                    sTime: sTimestamp,
                    eTime: eTimestamp,
                    description: row["Description"],
                    tags: [],
                    upVotes: 0,
                    createdAt: currentTime,
                  };
                  await activityRef.set(docObj);
                  const activityLogRef = db.collection("activityLog").doc();
                  await activityLogRef.set({ docObj });
                  for (let researcher of researchers) {
                    if (
                      researcher.fullname in row &&
                      strToBoolean(row[researcher.fullname])
                    ) {
                      await vote(researcher.fullname, activityRef.id, "upVote");
                    }
                  }
                }
              }
              rowIdx += 1;
              parser.resume();
            })
            .on("end", async (row) => {
              const endInterval = setInterval(() => {
                if (rowIdx >= 970) {
                  clearInterval(endInterval);
                  setTimeout(async () => {
                    rowIdx = 0;
                    setTimeout(() => {
                      researcherIdx += 1;
                    }, 4000);
                  }, 1000);
                }
              }, 1000);
            });
        }
      } else {
        clearInterval(researcherInterval);
      }
    }, 1000);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(500).json({ done: true });
};

// Clicking the Yes or No buttons in FreeRecallGrading.js under
// ProjectManagement would trigger this function. grade can be either true,
// meaning the researcher responded Yes, or false if they responded No.
exports.gradeFreeRecall = async (req, res) => {
  try {
    if (
      "grade" in req.body &&
      "fullname" in req.body &&
      "project" in req.body &&
      "user" in req.body &&
      "passageId" in req.body &&
      "passageIdx" in req.body &&
      "condition" in req.body &&
      "phrase" in req.body &&
      "session" in req.body &&
      "phraseNum" in req.body &&
      "response" in req.body
    ) {
      const grade = req.body.grade;
      const fullname = req.body.fullname;
      const project = req.body.project;
      const user = req.body.user;
      const condition = req.body.condition;
      const passageId = req.body.passageId;
      const passageIdx = req.body.passageIdx;
      const phrase = req.body.phrase;
      const session = req.body.session;
      const phraseNum = req.body.phraseNum;
      await db.runTransaction(async (t) => {
        // Accumulate all the transaction writes in an array to commit all of them
        // after all the reads to abide by the Firestore transaction law
        // https://firebase.google.com/docs/firestore/manage-data/transactions#transactions.
        const transactionWrites = [];
        // Because there will be multiple places to update this researcher data,
        // we should accumulate all the updates for this researcher to commit them
        // at the end of the transaction.
        const thisResearcherRef = db.collection("researchers").doc(fullname);
        const thisResearcherDoc = await t.get(thisResearcherRef);
        const thisResearcherData = thisResearcherDoc.data();
        const thisResearcherUpdates = thisResearcherData.projects[project];
        // The very first update we need to apply is to increment the number of
        // times they have graded a free-recall response.
        thisResearcherUpdates.gradingNum = thisResearcherUpdates.gradingNum
          ? thisResearcherUpdates.gradingNum + 1
          : 1;
        // recallGrades collection is huge and it's extremely inefficient to
        // search through it if all the docs for all projects are in the same
        // collection. Also, when querying them to find the appropriate doc to
        // show the authenticated researcher to grade, we cannot combine the
        // where clause on the project and the researchersNum < 4. As a
        // solution, we separated the collections per project, other than the
        // H2K2 project that we have already populated the data in and it's very
        // costly to rename.
        let collName = "recallGrades";
        if (project !== "H2K2") {
          collName += project;
        }
        // We need to check whether each of the other researchers have identified
        // the phrase in this free-recall response.
        const recallGradeQuery = db
          .collection(collName)
          .where("user", "==", user)
          .where("session", "==", session)
          .where("condition", "==", condition)
          .where("passage", "==", passageId)
          .where("phrase", "==", phrase);
        const recallGradeDocs = await t.get(recallGradeQuery);
        const recallGradeRef = db
          .collection(collName)
          .doc(recallGradeDocs.docs[0].id);
        const recallGradeData = recallGradeDocs.docs[0].data();
        if (!recallGradeData.researchers.includes(fullname)) {
          const recallGradeUpdates = {};
          // Only if all the 4 researchers (this one and 3 others) have graded
          // this case, then check whether it should be approved and assign the
          // points to the researchers and the participants.
          let approved = false;
          if (recallGradeData.researchersNum === 3) {
            // We need to figure out whether at least 3 out of 4 researchers marked it
            // as: (Yes), then it should be approved and we should give points to the
            // reseachers and the user; (No), then it should be approved and we should
            // give points to the researchers, but not the user.
            let identified = 0;
            let notIdentified = 0;
            for (let thisGrade of recallGradeData.grades) {
              identified += thisGrade;
              notIdentified += !thisGrade;
            }
            identified += grade;
            notIdentified += !grade;
            // It should be approved if more than or equal to 3 researchers have
            // unanimously identified/not identified this phrase in this free-recall
            // response.
            approved = identified >= 3 || notIdentified >= 3;
            if (approved) {
              const userRef = db.collection("users").doc(user);
              const userDoc = await t.get(userRef);
              const userData = userDoc.data();
              const userUpdates = {};
              // If identified >= 3, we should give the participant their free-recall
              // point.
              if (identified >= 3) {
                // Because the participant answers the free-recall questions for each
                // passage 3 time, in the 1st, 2nd, and 3rd sessions, we should
                // differentiate them when assigning their grades.
                let recallResponse;
                switch (session) {
                  case "1st":
                    recallResponse = "recallreGrade";
                    break;
                  case "2nd":
                    recallResponse = "recall3DaysreGrade";
                    break;
                  case "3rd":
                    recallResponse = "recall1WeekreGrade";
                    break;
                  default:
                  // code block
                }
                // The only piece of the user data that should be modified is
                // pCondition based on the point received.
                userUpdates.pConditions = userData.pConditions;
                let theGrade = 1;
                if (userUpdates.pConditions[passageIdx][recallResponse]) {
                  // We should add up points here because each free recall response
                  // may get multiple points from each of the key phrases identified
                  // in it.
                  theGrade +=
                    userUpdates.pConditions[passageIdx][recallResponse];
                }
                userUpdates.pConditions[passageIdx][recallResponse] = theGrade;
                // Depending on how many key phrases were in the passage, we should
                // calculate the free-recall response ratio.
                userUpdates.pConditions[passageIdx][recallResponse + "Ratio"] =
                  theGrade / phraseNum;
              }
              transactionWrites.push({
                type: "update",
                refObj: userRef,
                updateObj: userUpdates,
              });
              // For both identified >= 3 AND notIdentified >= 3 cases, we should give
              // a point to each of the researchers who unanimously
              // identified/notIdentified this phrase in this free recall response.
              for (
                let fResearcherIdx = 0;
                fResearcherIdx < recallGradeData.researchers.length;
                fResearcherIdx++
              ) {
                const researcherRef = db
                  .collection("researchers")
                  .doc(recallGradeData.researchers[fResearcherIdx]);
                const researcherDoc = await t.get(researcherRef);
                const researcherData = researcherDoc.data();
                if (
                  (identified >= 3 && recallGradeData.grades[fResearcherIdx]) ||
                  (notIdentified >= 3 &&
                    !recallGradeData.grades[fResearcherIdx])
                ) {
                  // Approve the recallGrade for all the researchers who
                  // unanimously identified/notIdentified this phrase in this free
                  // recall response.
                  recallGradeUpdates.approved = approved;
                  researcherData.projects[project].gradingPoints =
                    researcherData.projects[project].gradingPoints
                      ? researcherData.projects[project].gradingPoints + 0.5
                      : 0.5;
                  transactionWrites.push({
                    type: "update",
                    refObj: researcherRef,
                    updateObj: {
                      projects: researcherData.projects,
                    },
                  });
                }
                // If there are exactly 3 researchers who graded the same, but only
                // this researcher's grade (Yes/No) is different from the majority of
                // grades; we should give the opposing researcher a negative point.
                else if (
                  (identified === 3 &&
                    !recallGradeData.grades[fResearcherIdx]) ||
                  (notIdentified === 3 &&
                    recallGradeData.grades[fResearcherIdx])
                ) {
                  researcherData.projects[project].gradingPoints =
                    researcherData.projects[project].gradingPoints
                      ? researcherData.projects[project].gradingPoints - 0.5
                      : -0.5;
                  researcherData.projects[project].negativeGradingPoints =
                    researcherData.projects[project].negativeGradingPoints
                      ? researcherData.projects[project].negativeGradingPoints +
                        0.5
                      : 0.5;
                  transactionWrites.push({
                    type: "update",
                    refObj: researcherRef,
                    updateObj: {
                      projects: researcherData.projects,
                    },
                  });
                }
              }
              // If the authenticated researcher has graded the same as the majority
              // of grades:
              if (
                (identified >= 3 && grade) ||
                (notIdentified >= 3 && !grade)
              ) {
                // Because it's approved, we should also give the authenticated
                // researcher a point. We should update thisResearcherUpdates and
                // commit all the updates at the end to their document.
                thisResearcherUpdates.gradingPoints =
                  thisResearcherUpdates.gradingPoints
                    ? thisResearcherUpdates.gradingPoints + 0.5
                    : 0.5;
              }
              // If there are exactly 3 researchers who graded the same, but only the
              // authenticated researcher's grade (Yes/No) is different from the
              // majority of grades; we should give the the authenticated researcher a
              // negative point.
              else if (
                (identified === 3 && !grade) ||
                (notIdentified === 3 && grade)
              ) {
                thisResearcherUpdates.gradingPoints =
                  thisResearcherUpdates.gradingPoints
                    ? thisResearcherUpdates.gradingPoints - 0.5
                    : -0.5;
                thisResearcherUpdates.negativeGradingPoints =
                  thisResearcherUpdates.negativeGradingPoints
                    ? thisResearcherUpdates.negativeGradingPoints + 0.5
                    : 0.5;
              }
            }
          }
          // After accumulating all the updates for the authenticated researcher,
          // now we can update their document.
          transactionWrites.push({
            type: "update",
            refObj: thisResearcherRef,
            updateObj: {
              projects: {
                ...thisResearcherData.projects,
                [project]: thisResearcherUpdates,
              },
            },
          });
          for (let transactionWrite of transactionWrites) {
            if (transactionWrite.type === "update") {
              t.update(transactionWrite.refObj, transactionWrite.updateObj);
            } else if (transactionWrite.type === "set") {
              t.set(transactionWrite.refObj, transactionWrite.updateObj);
            } else if (transactionWrite.type === "delete") {
              t.delete(transactionWrite.refObj);
            }
          }
          // Finally, we should create the recallGrades doc for this new grade.
          t.update(recallGradeRef, {
            ...recallGradeUpdates,
            researchers: [...recallGradeData.researchers, fullname],
            grades: [...recallGradeData.grades, grade],
            researchersNum: recallGradeData.researchersNum + 1,
            updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
          });
        }
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ done: true });
};

exports.assignExperimentSessionsPoints = async (context) => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    const researchersInfo = [];
    // Retrieve all the researchers to check availabilities per researcher,
    // per project, only if the researcher is active in that project.
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      if ("projects" in researcherData) {
        for (let project in researcherData.projects) {
          if (researcherData.projects[project].active) {
            const resScheduleDocs = await db
              .collection("resSchedule")
              .where("project", "==", project)
              .where("fullname", "==", researcherDoc.id)
              .get();
            let lastAvailability = new Date();
            for (let resScheduleDoc of resScheduleDocs.docs) {
              const resScheduleData = resScheduleDoc.data();
              const theSession = resScheduleData.session.toDate();
              if (theSession.getTime() > lastAvailability.getTime()) {
                lastAvailability = theSession;
              }
            }
            let tenDaysLater = new Date();
            tenDaysLater = new Date(
              tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000
            );
            if (lastAvailability.getTime() < tenDaysLater.getTime()) {
              // Send a reminder email to a researcher that they have not specified
              // their availability for the next ten days and ask them to specify it.
              setTimeout(() => {
                remindResearcherToSpecifyAvailability(
                  researcherData.email,
                  researcherDoc.id,
                  "ten"
                );
              }, waitTime);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
            }
          }
        }
        researchersInfo.push({
          fullname: researcherDoc.id,
          email: researcherData.email,
          projects: Object.keys(researcherData.projects),
        });
      }
    }
    const oneWebIdx = researchersInfo.findIndex(
      (researcher) => researcher.email.toLowerCase() === "oneweb@umich.edu"
    );
    const usersInfo = [];
    const usersDocs = await db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
      const userData = userDoc.data();
      usersInfo.push({
        fullname: userDoc.id,
        email: userData.email,
        project: userData.project,
      });
    }
    const pastEvents = await allPastEvents();
    if (pastEvents) {
      for (let pastEvent of pastEvents) {
        if (pastEvent.attendees) {
          let researcherObjs = [];
          let userObj = null;
          const attendees = [];
          for (let attendee of pastEvent.attendees) {
            attendees.push(attendee.email);
            const rIdx = researchersInfo.findIndex(
              (researcher) =>
                researcher.email.toLowerCase() === attendee.email.toLowerCase()
            );
            if (rIdx !== -1) {
              researcherObjs.push(researchersInfo[rIdx]);
            }
            const uIdx = usersInfo.findIndex(
              (user) =>
                user.email.toLowerCase() === attendee.email.toLowerCase()
            );
            if (uIdx !== -1) {
              userObj = usersInfo[uIdx];
            }
          }
          if (
            researcherObjs.findIndex(
              (researcher) =>
                researcher.email.toLowerCase() === "oneweb@umich.edu"
            ) === -1
          ) {
            researcherObjs.push(researchersInfo[oneWebIdx]);
          }
          if (userObj && researcherObjs.length > 0) {
            const project = userObj.project;
            for (let researcherObj of researcherObjs) {
              if (researcherObj.projects.includes(project)) {
                const sTime = new Date(pastEvent.start.dateTime);
                const eTime = new Date(pastEvent.end.dateTime);
                const { sTimestamp, eTimestamp } = getActivityTimeStamps(
                  sTime,
                  sTime,
                  eTime
                );
                const currentTime = admin.firestore.Timestamp.fromDate(
                  new Date()
                );
                const expSessionDocs = await db
                  .collection("expSessions")
                  .where("attendees", "==", attendees)
                  .where("sTime", "==", sTime)
                  .get();
                if (expSessionDocs.docs.length === 0) {
                  let points = 7;
                  if (eTime.getTime() > sTime.getTime() + 40 * 60 * 1000) {
                    points = 16;
                  }
                  try {
                    await db.runTransaction(async (t) => {
                      const researcherRef = db
                        .collection("researchers")
                        .doc(researcherObj.fullname);
                      const researcherDoc = await t.get(researcherRef);
                      const researcherData = researcherDoc.data();
                      let researcherExpPoints = 0;
                      if (researcherData.projects[project].expPoints) {
                        researcherExpPoints =
                          researcherData.projects[project].expPoints;
                      }
                      const researcherProjectUpdates = {
                        projects: {
                          ...researcherData.projects,
                          [project]: {
                            ...researcherData.projects[project],
                            expPoints: researcherExpPoints + points,
                          },
                        },
                      };
                      t.update(researcherRef, researcherProjectUpdates);
                      const researcherLogRef = db
                        .collection("researcherLogs")
                        .doc();
                      t.set(researcherLogRef, {
                        ...researcherProjectUpdates,
                        id: researcherRef.id,
                        updatedAt: currentTime,
                      });
                      const expSessionRef = db.collection("expSessions").doc();
                      t.set(expSessionRef, {
                        attendees,
                        project,
                        points,
                        sTime: sTimestamp,
                        eTime: eTimestamp,
                        createdAt: currentTime,
                      });
                    });
                  } catch (e) {
                    console.log("Transaction failure:", e);
                  }
                }
              } else {
                console.log({ project, projects: researcherObj.projects });
              }
            }
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

// This is called in a pubsub every 25 hours.
// Email reminders to researchers that they have not added/voted any instructors
// over the past week and ask them to add/vote instructors and administrators.
exports.remindAddingInstructorsAdministrators = async (context) => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    // Retrieve all the researchers to check daily contributions per researcher,
    // per project, only if the researcher is active in that project.
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      if ("projects" in researcherData) {
        for (let project in researcherData.projects) {
          if (researcherData.projects[project].active) {
            // A sorted array of days where the researcher
            // got the point for adding new instrutors/administrators.
            const dayInstructors = [];
            const resScheduleDocs = await db
              .collection("dayInstructors")
              .where("project", "==", project)
              .where("fullname", "==", researcherDoc.id)
              .get();
            for (let resScheduleDoc of resScheduleDocs.docs) {
              const resScheduleData = resScheduleDoc.data();
              const theSession = resScheduleData.session.toDate();
              if (theSession.getTime() > lastAvailability.getTime()) {
                lastAvailability = theSession;
              }
            }
            let tenDaysLater = new Date();
            tenDaysLater = new Date(
              tenDaysLater.getTime() + 10 * 24 * 60 * 60 * 1000
            );
            if (lastAvailability.getTime() < tenDaysLater.getTime()) {
              // Send a reminder email to a researcher that they have not accepted
              // or even declined the Google Calendar invitation and asks them to
              // accept it or ask someone else to take it.
              setTimeout(() => {
                researcherEventNotificationEmail(
                  attendee.email,
                  researchers[attendee.email],
                  participant.email,
                  hoursLeft,
                  order,
                  attendee.responseStatus === "declined" ||
                    attendee.responseStatus === "tentative"
                );
              }, waitTime);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
            }
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

// This is called in a pubsub every 4 hours.
// Email reminders to researchers and participants to do the following:
// For future Google Calendar events, to:
// - Accept their invitations
// - Reschedule if they have declined them
// For passed Google Calendar events, to:
// - Reschedule if they have missed or declined them.
exports.remindCalendarInvitations = async (context) => {
  try {
    // researchers = an object of emails as keys and the corresponding fullnames as values.
    const researchers = {};
    const researcherDocs = await db.collection("researchers").get();
    for (let researcherDoc of researcherDocs.docs) {
      const researcherData = researcherDoc.data();
      let isActive = false;
      for (let proj in researcherData.projects) {
        if (researcherData.projects[proj].active) {
          isActive = true;
        }
      }
      if (isActive) {
        researchers[researcherData.email.toLowerCase()] = researcherDoc.id;
      }
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
        schId: scheduleDoc.id,
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
      if (
        ev.id in schedule &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        // Get the participant's email and order through the scheduled session.
        const participant = {
          email: schedule[ev.id].email.toLowerCase(),
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
                  attendee.responseStatus === "declined" ||
                    attendee.responseStatus === "tentative"
                );
              }, waitTime);
              // Increase waitTime by a random integer between 1 to 4 seconds.
              waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
            }
            // Find the attendee who corresponds to this participant:
            else if (attendee.email.toLowerCase() === participant.email) {
              // The only way to get the user data, like their firstname, which
              // sessions they have completed so far, ... is through "users"
              const userDocs = await db
                .collection("users")
                .where("email", "==", attendee.email.toLowerCase())
                .get();
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
                if (
                  attendee.responseStatus === "declined" ||
                  attendee.responseStatus === "tentative"
                ) {
                  // If they have declined the 1st session, but they are not done
                  // with the 1st session:
                  if (order === "1st" && !participant.firstDone) {
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
                    const scheduleRef = db
                      .collection("schedule")
                      .doc(schedule[ev.id].schId);
                    await scheduleRef.update({
                      id: admin.firestore.FieldValue.delete(),
                      order: admin.firestore.FieldValue.delete(),
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
        };
        const order = schedule[ev.id].order;
        for (let attendee of ev.attendees) {
          // We only need to check the past events for the participants.
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
            // The only way to get the user data, like their firstname, which
            // sessions they have completed so far, ... is through "users"
            const userDocs = await db
              .collection("users")
              .where("email", "==", attendee.email.toLowerCase())
              .get();
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
              if (order === "1st" && !participant.firstDone) {
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
                    attendee.responseStatus === "declined" ||
                      attendee.responseStatus === "tentative",
                    null
                  );
                }, waitTime);
                waitTime += 1000 * (1 + Math.floor(Math.random() * 4));
              } else if (order === "3rd" && !participant.secondDone) {
                // If it's their 3rd session, but they did not complete their 2nd session:
                // Delete the 3rd session, because logically they should not go through
                // the 3rd session without completing the 2nd one.
                await deleteEvent(ev.id);
                // Also, remove the Calendar event id and order from their schedule doc.
                const scheduleRef = db
                  .collection("schedule")
                  .doc(schedule[ev.id].schId);
                await scheduleRef.update({
                  id: admin.firestore.FieldValue.delete(),
                  order: admin.firestore.FieldValue.delete(),
                });
              } else if (isToday(startTime)) {
                // Only if it is a 2nd/3rd session that was scheduled today, but they
                // missed it, we email them to reschedule their session on the same day;
                // otherwise, we will withdraw their application.
                if (
                  (order === "2nd" && !participant.secondDone) ||
                  (order === "3rd" && !participant.thirdDone)
                ) {
                  setTimeout(() => {
                    notAttendedEmail(
                      participant.email,
                      participant.firstname,
                      false,
                      participant.courseName,
                      order
                    );
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
// Deprecated
// exports.updateNotTakenSessions = async (context) => {
//   try {
//     const eventIds = [];
//     const allEvents = await futureEvents(40);
//     if (allEvents) {
//       const currentTime = new Date().getTime();
//       // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
//       for (let ev of allEvents) {
//         eventIds.push(ev.id);
//         const notTakenSessionsRef = db
//           .collection("notTakenSessions")
//           .doc(ev.id);
//         const notTakenSessionsDoc = await notTakenSessionsRef.get();
//         if (!("attendees" in ev) || ev.attendees.length < 2) {
//           if (!notTakenSessionsDoc.exists) {
//             const startTime = new Date(ev.start.dateTime).getTime();
//             const endTime = new Date(ev.end.dateTime).getTime();
//             const hoursLeft = Math.floor(
//               (startTime - currentTime) / (60 * 60 * 1000)
//             );
//             let points = 7;
//             if (endTime > startTime + 40 * 60 * 1000) {
//               points = 16;
//             }
//             await batchSet(notTakenSessionsRef, {
//               start: new Date(ev.start.dateTime),
//               end: new Date(ev.end.dateTime),
//               id: ev.id,
//               hoursLeft,
//               points,
//             });
//           }
//         } else {
//           if (notTakenSessionsDoc.exists) {
//             await batchDelete(notTakenSessionsRef);
//           }
//         }
//       }
//     }
//     const notTakenSessionsDocs = await db.collection("notTakenSessions").get();
//     for (let notTakenSessionDoc of notTakenSessionsDocs.docs) {
//       if (!eventIds.includes(notTakenSessionDoc.id)) {
//         const notTakenSessionsRef = db
//           .collection("notTakenSessions")
//           .doc(notTakenSessionDoc.id);
//         await batchDelete(notTakenSessionsRef);
//       }
//     }
//     await commitBatch();
//   } catch (err) {
//     console.log({ err });
//   }
//   return null;
// };
