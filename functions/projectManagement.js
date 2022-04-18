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
const {
  allPastEvents,
  futureEvents,
  todayPastEvents,
} = require("./scheduling");
const {
  strToBoolean,
  getActivityTimeStamps,
  getIn30Minutes,
  getDateString,
} = require("./utils");
const {
  reschEventNotificationEmail,
  eventNotificationEmail,
  notAttendedEmail,
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

exports.loadfeedbackCodes = async (req, res) => {
  try {
    let userDocs = await db.collection("users").get();
    userDocs = userDocs.docs;
    // for (let userDoc of userDocs) {
    //   if (userDoc.data().explanations) {
    //     console.log({
    //       uid: userDoc.id,
    //       explanation: userDoc.data().explanations[0],
    //     });
    //   }
    // }
    // const foundUserExplanantions = {};
    const project = "H2K2";
    const coders = ["Zoe Dunnum", "Jasmine Wu"];
    const columnName = "explanations";
    const expIdx = 0;
    const ws = fs.createReadStream(
      "/datasets/Experiment Data - Copy of Coding Q1 Phase 1.csv"
    );
    let rowIdx = 0;
    const parser = csv
      .parseStream(ws, { headers: true })
      .on("error", (error) => {
        console.error(error);
        return res.status(500).json({ error });
      })
      .on("data", async (row) => {
        console.log(rowIdx);
        parser.pause();
        if (row["explanation1"]) {
          const explanation = row["explanation1"].replace(
            /(\r\n|\n|\r|[ ])/gm,
            ""
          );
          let userIndex = -1;
          for (let userIdx = 0; userIdx < userDocs.length; userIdx++) {
            const userDoc = userDocs[userIdx];
            const userData = userDoc.data();
            if (userData.explanations) {
              if (
                userData.explanations[expIdx].replace(
                  /(\r\n|\n|\r|[ ])/gm,
                  ""
                ) === explanation
              ) {
                userIndex = userIdx;
                break;
              }
            }
          }
          if (userIndex === -1) {
            console.log({ [columnName]: row["explanation1"] });
          } else {
            // if (userDocs[userIndex].id in foundUserExplanantions) {
            //   foundUserExplanantions[userDocs[userIndex].id].push(
            //     row["explanation1"]
            //   );
            // } else {
            //   foundUserExplanantions[userDocs[userIndex].id] = [
            //     row["explanation1"],
            //   ];
            // }
            const currentTime = admin.firestore.Timestamp.fromDate(new Date());
            for (let coder of coders) {
            }
          }
        }
        rowIdx += 1;
        parser.resume();
      })
      .on("end", async (row) => {
        // for (let uid in foundUserExplanantions) {
        //   if (foundUserExplanantions[uid].length < 1) {
        //     console.log({
        //       uid,
        //       explanations: foundUserExplanantions[uid],
        //     });
        //   } else if (foundUserExplanantions[uid].length > 1) {
        //     console.log({
        //       uid,
        //       explanations: foundUserExplanantions[uid],
        //     });
        //   }
        // }
      });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(500).json({ done: true });
};

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
            "/datasets/Linear, Hybrid, or Non-linear Knowledge RCT - " +
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

exports.assignExperimentSessionsPoints = async (context) => {
  try {
    const researchersInfo = [];
    const researchersDocs = await db.collection("researchers").get();
    for (let researcherDoc of researchersDocs.docs) {
      const researcherData = researcherDoc.data();
      for (let project in projectsData) {
        if (researcherData.email === "onecademy@umich.edu") {
          const resScheduleDocs = await db
            .collection("resSchedule")
            .where("project", "==", researcherData.project)
            .where("fullname", "==", researcherDoc.id)
            .get();
          let lastAvailability;
          for (let resScheduleDoc of resScheduleDocs.docs) {
            const resScheduleData = resScheduleDoc.data();
          }
        }
      }
      researchersInfo.push({
        fullname: researcherDoc.id,
        email: researcherData.email,
        projects: Object.keys(researcherData.projects),
      });
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

exports.remindCalendarInvitations = async (context) => {
  try {
    const scheduleDocs = await db.collection("schedule").orderBy("id").get();
    const schedule = [];
    for (let scheduleDoc of scheduleDocs.docs) {
      schedule.push(scheduleDoc.data());
    }
    let waitTime = 0;
    const allEvents = await futureEvents(40);
    const currentTime = new Date().getTime();
    // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of allEvents) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      const scheduleIdx = schedule.findIndex((sch) => sch.id === ev.id);
      if (
        scheduleIdx !== -1 &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        const participant = {
          email: schedule[scheduleIdx].email.toLowerCase(),
        };
        const order = schedule[scheduleIdx].order;
        for (let attendee of ev.attendees) {
          if (attendee.email.toLowerCase() === participant.email) {
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
              if (
                attendee.responseStatus === "declined" ||
                attendee.responseStatus === "tentative"
              ) {
                if (order === "1st" && !participant.firstDone) {
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
                  waitTime += 1000 * (1 + Math.floor(Math.random() * 40));
                }
              } else if (
                attendee.responseStatus !== "accepted" &&
                hoursLeft <= 25
              ) {
                if (order === "3rd" && !participant.secondDone) {
                  await deleteEvent(ev.id);
                } else {
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
                      false
                    );
                  }, waitTime);
                  waitTime += 1000 * (1 + Math.floor(Math.random() * 40));
                }
              }
            }
          }
        }
      }
    }
    const todayPastEvs = await todayPastEvents();
    // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
    for (let ev of todayPastEvs) {
      const startTime = new Date(ev.start.dateTime).getTime();
      const hoursLeft = (startTime - currentTime) / (60 * 60 * 1000);
      const scheduleIdx = schedule.findIndex((sch) => sch.id === ev.id);
      if (
        scheduleIdx !== -1 &&
        "attendees" in ev &&
        Array.isArray(ev.attendees)
      ) {
        const participant = {
          email: schedule[scheduleIdx].email.toLowerCase(),
        };
        const order = schedule[scheduleIdx].order;
        for (let attendee of ev.attendees) {
          if (attendee.email.toLowerCase() === participant.email) {
            participant.responseStatus = attendee.responseStatus;
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
                waitTime += 1000 * (1 + Math.floor(Math.random() * 40));
              } else if (
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
                waitTime += 1000 * (1 + Math.floor(Math.random() * 40));
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

exports.updateNotTakenSessions = async (context) => {
  try {
    const eventIds = [];
    const allEvents = await futureEvents(40);
    if (allEvents) {
      const currentTime = new Date().getTime();
      // attendee.responseStatus: 'accepted', 'needsAction', 'tentative', 'declined'
      for (let ev of allEvents) {
        eventIds.push(ev.id);
        const notTakenSessionsRef = db
          .collection("notTakenSessions")
          .doc(ev.id);
        const notTakenSessionsDoc = await notTakenSessionsRef.get();
        if (!("attendees" in ev) || ev.attendees.length < 2) {
          if (!notTakenSessionsDoc.exists) {
            const startTime = new Date(ev.start.dateTime).getTime();
            const endTime = new Date(ev.end.dateTime).getTime();
            const hoursLeft = Math.floor(
              (startTime - currentTime) / (60 * 60 * 1000)
            );
            let points = 7;
            if (endTime > startTime + 40 * 60 * 1000) {
              points = 16;
            }
            await batchSet(notTakenSessionsRef, {
              start: new Date(ev.start.dateTime),
              end: new Date(ev.end.dateTime),
              id: ev.id,
              hoursLeft,
              points,
            });
          }
        } else {
          if (notTakenSessionsDoc.exists) {
            await batchDelete(notTakenSessionsRef);
          }
        }
      }
    }
    const notTakenSessionsDocs = await db.collection("notTakenSessions").get();
    for (let notTakenSessionDoc of notTakenSessionsDocs.docs) {
      if (!eventIds.includes(notTakenSessionDoc.id)) {
        const notTakenSessionsRef = db
          .collection("notTakenSessions")
          .doc(notTakenSessionDoc.id);
        await batchDelete(notTakenSessionsRef);
      }
    }
    await commitBatch();
  } catch (err) {
    console.log({ err });
  }
  return null;
};
