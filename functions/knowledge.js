const axios = require("axios");
const fs = require("fs");

const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin_Knowledge");
const { getTypedCollections } = require("./getTypedCollections");

// On 1Cademy.com nodes do not have their list of contributors and institutions
// assigned to them. We should run this function every 25 hours in a PubSub to
// assign these arrays.
exports.assignNodeContributorsAndInstitutions = async (context) => {
  try {
    // First get the list of all users and create an Object to map their ids to their
    // institution names.
    const userInstitutions = {};
    const userFullnames = {};
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      userInstitutions[userDoc.id] = userData.deInstit;
      userFullnames[userDoc.id] = userData.firstname + " " + userData.lastname;
    }
    // Retrieving all the nodes data and saving them in nodesData, so that we don't
    // need to retrieve them one by one, over and over again.
    const nodesData = {};
    const nodeDocs = await db.collection("nodes").get();
    for (let nodeDoc of nodeDocs.docs) {
      nodesData[nodeDoc.id] = nodeDoc.data();
    }
    // We should retrieve all the accepted versions for all types of nodes.
    const nodeTypes = [
      "Concept",
      "Code",
      "Relation",
      "Question",
      "Reference",
      "Idea",
    ];
    for (let nodeType of nodeTypes) {
      console.log("Started nodeType: ", nodeType);
      // We cannot update the reputations on nodes only looking at the
      // versions (proposals) that are not considerred yet, because the
      // pervious versions may get new votes. So, we accumulate all the
      // votes on all accepted proposals every time we run this function.
      // So, we need to create a nodes object to keep track of all the
      // updates and finally batch write all of them into nodes collection.
      const nodesUpdates = {};
      const { versionsColl } = getTypedCollections(db, nodeType);
      const versionDocs = await versionsColl
        .where("accepted", "==", true)
        .get();
      for (let versionDoc of versionDocs.docs) {
        const versionData = versionDoc.data();
        // Only if the version has never been deleted, i.e., deleted attribute does not
        // exist or it's false:
        if (!versionData.deleted) {
          // We should add the proposer's id and institution
          // to the contributors and institutions arrays in the corresponding node.
          const nodeRef = db.collection("nodes").doc(versionData.node);
          if (versionData.node in nodesData) {
            // Only if the node does not exist in nodesUpdates, we need to create it,
            // and add the nodeRef to be able to update the node at the end.
            if (!(versionData.node in nodesUpdates)) {
              nodesUpdates[versionData.node] = {
                nodeRef,
              };
            }
            // In institutions and contributors, each key represents an
            // institution or contributor and the corresponding value is
            // the reputation of the institution or contributor on the node.
            // For the contributors, it also includes the fullname.
            // A user may have multiple accepted proposals on a node. However,
            // We have to update the node multiple times for such a user because
            // we should update their reputation points on the node.
            if (!("contributors" in nodesUpdates[versionData.node])) {
              nodesUpdates[versionData.node].contributors = {};
            }
            if (!("institutions" in nodesUpdates[versionData.node])) {
              nodesUpdates[versionData.node].institutions = {};
            }
            // We also need to add the names of contributors and institutions in
            // separate fields to be able to directly query them.
            if (!("contribNames" in nodesUpdates[versionData.node])) {
              nodesUpdates[versionData.node].contribNames = [];
            }
            if (!("institNames" in nodesUpdates[versionData.node])) {
              nodesUpdates[versionData.node].institNames = [];
            }
            if (
              !(
                versionData.proposer in
                nodesUpdates[versionData.node].contributors
              ) &&
              versionData.proposer in userFullnames &&
              "imageUrl" in versionData
            ) {
              nodesUpdates[versionData.node].contribNames.push(
                versionData.proposer
              );
              nodesUpdates[versionData.node].contributors[
                versionData.proposer
              ] = {
                fullname: userFullnames[versionData.proposer],
                imageUrl: versionData.imageUrl,
                chooseUname: versionData.chooseUname
                  ? versionData.chooseUname
                  : false,
                reputation: 0,
              };
              if (
                versionData.proposer in userInstitutions &&
                !(
                  userInstitutions[versionData.proposer] in
                  nodesUpdates[versionData.node].institutions
                )
              ) {
                nodesUpdates[versionData.node].institNames.push(
                  userInstitutions[versionData.proposer]
                );
                nodesUpdates[versionData.node].institutions[
                  userInstitutions[versionData.proposer]
                ] = {
                  reputation: 0,
                };
              }
            }
            if (
              versionData.proposer in
              nodesUpdates[versionData.node].contributors
            ) {
              nodesUpdates[versionData.node].contributors[
                versionData.proposer
              ].reputation += versionData.corrects - versionData.wrongs;
            }
            if (
              versionData.proposer in userInstitutions &&
              userInstitutions[versionData.proposer] in
                nodesUpdates[versionData.node].institutions
            ) {
              nodesUpdates[versionData.node].institutions[
                userInstitutions[versionData.proposer]
              ].reputation += versionData.corrects - versionData.wrongs;
            }
          }
        }
      }
      for (nodeId in nodesUpdates) {
        await batchUpdate(nodesUpdates[nodeId].nodeRef, {
          contributors: nodesUpdates[nodeId].contributors,
          institutions: nodesUpdates[nodeId].institutions,
          contribNames: nodesUpdates[nodeId].contribNames,
          institNames: nodesUpdates[nodeId].institNames,
        });
      }
    }
    await commitBatch();

    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

// On 1Cademy.com when users sign up, we do not make the corresponding changes
// to the institutions collection. We should run this function every 25 hours in
// a PubSub to assign these arrays.
exports.updateInstitutions = async (req, res) => {
  try {
    const rawdata = fs.readFileSync(__dirname + "/edited_universities.json");
    const institutionsData = JSON.parse(rawdata);

    let userDocs = await db.collection("users").get();
    userDocs = [...userDocs.docs];
    for (let instObj of institutionsData) {
      for (let userDoc of userDocs) {
        const userData = userDoc.data();
        const domainName = userData.email.match("@(.+)$")[0];
        if (
          (domainName.includes(instObj.domains) &&
            domainName !== "@bgsu.edu") ||
          (instObj.domains === "bgsu.edu" && domainName === "@bgsu.edu")
        ) {
          console.log({ username: userData.uname, instObj });
          const userRef = db.collection("users").doc(userDoc.id);
          await userRef.update({ deInstit: instObj.name });
          const instQuery = db
            .collection("institutions")
            .where("name", "==", instObj.name)
            .limit(1);
          await db.runTransaction(async (t) => {
            const instDocs = await t.get(instQuery);
            if (instDocs.docs.length > 0) {
              const instRef = db
                .collection("institutions")
                .doc(instDocs.docs[0].id);
              const institData = instDocs.docs[0].data();
              if (!institData.users.includes(userDoc.id)) {
                const instDomains = [...institData.domains];
                if (!instDomains.includes(domainName)) {
                  instDomains.push(domainName);
                }
                t.update(instRef, {
                  users: [...institData.users, userDoc.id],
                  usersNum: institData.usersNum + 1,
                  domains: instDomains,
                });
              }
            } else {
              const instRef = db.collection("institutions").doc();
              try {
                const response = await axios.get(
                  encodeURI(
                    "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=" +
                      instObj.name
                  )
                );
                const geoLoc = response.data.results[0].geometry.location;
                t.set(instRef, {
                  country: "USA",
                  lng: geoLoc.lng,
                  lat: geoLoc.lat,
                  logoURL: encodeURI(
                    "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/" +
                      instObj.name +
                      ".png"
                  ),
                  domains: [domainName],
                  name: instObj.name,
                  users: [userDoc.id],
                  usersNum: 1,
                });
              } catch (err) {
                console.log(err);
              }
            }
          });
        }
      }
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

exports.fixInstitutionInUsers = async (req, res) => {
  try {
    const institutionsObj = await import("./datasets/edited_universities.json");
    let institutionsList = institutionsObj.default.map((l) => l.name);
    institutionsList = [...new Set(institutionsList)];
    const userDocs = await admin.db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      const email = userData.email;
    }
  } catch (err) {
    console.log({ err });
    return null;
  }
};

// const fs = require("fs");
// const csv = require("csv-parser");
// exports.createInstitutionsCollection = (req, res) => {
//   fs.createReadStream(__dirname + "/Interns_Institutions.csv")
//     .pipe(csv())
//     .on("data", async (row) => {
//       let userRef, userDocs, instDocs;
//       let emailsInsts = [
//         {
//           email: Object.keys(row)[2],
//           institution: Object.keys(row)[3],
//         },
//         {
//           email: Object.values(row)[2],
//           institution: Object.values(row)[3],
//         },
//       ];
//       for (let { email, institution } of emailsInsts) {
//         if (institution !== "" && email !== "Email") {
//           userDocs = await db
//             .collection("users")
//             .where("email", "==", email)
//             .limit(1)
//             .get();
//           if (userDocs.docs.length > 0) {
//             userRef = db.collection("users").doc(userDocs.docs[0].id);
//             await userRef.update({ deInstit: institution });
//           }
//         }
//       }
//     })
//     .on("error", (err) => {
//       return res.status(200).json(err);
//     })
//     .on("end", () => {
//       return res.status(200).json("Done.");
//     });
// };
