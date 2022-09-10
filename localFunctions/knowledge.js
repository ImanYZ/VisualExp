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

exports.downloadNodes = async (req, res) => {
  const nodesDocs = await db.collection("nodes").get();
  if (nodesDocs.docs.length > 0) {
    const createCsvWriter = require("csv-writer").createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: "nodes.csv",
      header: [
        { id: "id", title: "id" },
        { id: "admin", title: "admin" },
        { id: "changedAt", title: "changedAt" },
        { id: "children", title: "children" },
        { id: "childrenLength", title: "childrenLength" },
        { id: "choices", title: "choices" },
        { id: "choicesLength", title: "choicesLength" },
        { id: "closedHeight", title: "closedHeight" },
        { id: "comments", title: "comments" },
        { id: "content", title: "content" },
        { id: "corrects", title: "corrects" },
        { id: "createdAt", title: "createdAt" },
        { id: "deleted", title: "deleted" },
        { id: "height", title: "height" },
        { id: "maxVersionRating", title: "maxVersionRating" },
        { id: "nodeImage", title: "nodeImage" },
        { id: "nodeType", title: "nodeType" },
        { id: "parents", title: "parents" },
        { id: "parentsLength", title: "parentsLength" },
        { id: "references", title: "references" },
        { id: "referencesLength", title: "referencesLength" },
        { id: "studied", title: "studied" },
        { id: "tags", title: "tags" },
        { id: "tagsLength", title: "tagsLength" },
        { id: "title", title: "title" },
        { id: "updatedAt", title: "updatedAt" },
        { id: "versions", title: "versions" },
        { id: "viewers", title: "viewers" },
        { id: "wrongs", title: "wrongs" },
      ],
    });
    const data = [];
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      nodeData.id = nodeDoc.id;
      if ("changedAt" in nodeData && nodeData.changedAt) {
        nodeData.changedAt = nodeData.changedAt.toDate();
      }
      if ("createdAt" in nodeData && nodeData.createdAt) {
        nodeData.createdAt = nodeData.createdAt.toDate();
      }
      if ("updatedAt" in nodeData && nodeData.updatedAt) {
        nodeData.updatedAt = nodeData.updatedAt.toDate();
      }
      if ("children" in nodeData && nodeData.children) {
        nodeData.childrenLength = nodeData.children.length;
        nodeData.children = JSON.stringify(nodeData.children);
      } else {
        nodeData.children = "";
        nodeData.childrenLength = 0;
      }
      if ("choices" in nodeData && nodeData.choices) {
        nodeData.choicesLength = nodeData.choices.length;
        nodeData.choices = JSON.stringify(nodeData.choices);
      } else {
        nodeData.choices = "";
        nodeData.choicesLength = 0;
      }
      if ("parents" in nodeData && nodeData.parents) {
        nodeData.parentsLength = nodeData.parents.length;
        nodeData.parents = JSON.stringify(nodeData.parents);
      } else {
        nodeData.parents = "";
        nodeData.parentsLength = 0;
      }
      if ("references" in nodeData && nodeData.references) {
        nodeData.referencesLength = nodeData.references.length;
        nodeData.references = JSON.stringify(nodeData.references);
      } else {
        nodeData.references = "";
        nodeData.referencesLength = 0;
      }
      if ("tags" in nodeData && nodeData.tags) {
        nodeData.tagsLength = nodeData.tags.length;
        nodeData.tags = JSON.stringify(nodeData.tags);
      } else {
        nodeData.tags = "";
        nodeData.tagsLength = 0;
      }
      data.push(nodeData);
    }
    csvWriter
      .writeRecords(data)
      .then(() => console.log("The CSV file was written successfully."))
      .catch((err) => console.log("Error:", err));
  } else {
    console.log("I found no nodes.");
  }
  return res.json("The CSV file was written successfully.");
};

// Fix the institution for those users who registerred before the institutions
// drop-down menu.
exports.fixInstitutionInUsers = async (req, res) => {
  try {
    const rawdata = fs.readFileSync(
      __dirname + "/functions/datasets/edited_universities.json"
    );
    const institutionsData = JSON.parse(rawdata);

    let userDocs = await db.collection("users").get();
    userDocs = [...userDocs.docs];
    let domainsNW = [];
    for (let instObj1 of institutionsData) {
      for (let instObj2 of institutionsData) {
        if (
          instObj1.domains.includes(instObj2.domains) &&
          instObj1.name !== instObj2.name
        ) {
          domainsNW.push(instObj2.domains)
        }
      }
    }

    for (let instObj of institutionsData) {
      console.log(instObj.name);
      for (let userDoc of userDocs) {
        const userData = userDoc.data();
        const domainName = userData.email.match("@(.+)$")[0];

        if (
          (domainName.includes(instObj.domains) &&
          !domainsNW.includes(domainName)) ||
          (instObj.domains === domainName )
        ) {
          console.log({ username: userData.uname, instObj });
          const userRef = db.collection("users").doc(userDoc.id);
          await batchUpdate(userRef, { deInstit: instObj.name });
        }
      }
    }
    await commitBatch();
    console.log("Done.");
  } catch (err) {
    console.log({ err });
    return null;
  }
};

exports.identifyDuplicateInstitutionDomains = async (req, res) => {
  try {
    const rawdata = fs.readFileSync(
      __dirname + "/datasets/edited_universities.json"
    );
    const institutionsData = JSON.parse(rawdata);

    for (let instObj1 of institutionsData) {
      for (let instObj2 of institutionsData) {
        if (
          instObj1.domains.includes(instObj2.domains) &&
          instObj1.name !== instObj2.name
        ) {
          console.log(instObj1.domains + ", " + instObj2.domains);
        }
      }
    }
    console.log("Done.");
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
const roundNum = (num) => Number(Number.parseFloat(Number(num).toFixed(2)));
exports.assignNodeContributorsInstitutionsStats = async (req, res) => {
  try {
    // First get the list of all users and create an Object to map their ids to their
    // institution names.
    console.log("Start");
    const userInstitutions = {};
    const userFullnames = {};
    let institutions = new Set();
    const stats = {
      users: 0,
      institutions: 0,
      nodes: 0,
      links: 0,
      proposals: 0,
      createdAt: new Date(),
    };
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      userInstitutions[userDoc.id] = userData.deInstit;
      userFullnames[userDoc.id] = userData.fName + " " + userData.lName;
      stats.users += 1;
      institutions.add(userData.deInstit);
    }
    stats.institutions = institutions.size;

    const contributors = {};
    institutions = {};
    const tags = {};
    const references = {};
    // Retrieving all the nodes data and saving them in nodesData, so that we don't
    // need to retrieve them one by one, over and over again.
    const nodesData = {};
    const nodeDocs = await db.collection("nodes").get();
    for (let nodeDoc of nodeDocs.docs) {
      const nodeData = nodeDoc.data();
      nodesData[nodeDoc.id] = nodeData;
      stats.nodes += 1;
      stats.links +=
        (nodeData.parents.length + nodeData.children.length) / 2 +
        nodeData.tags.length +
        nodeData.references.length;
      for (let tag of nodeData.tags) {
        if (tag.node in tags) {
          tags[tag.node].push(nodeDoc.id);
        } else {
          tags[tag.node] = [];
        }
      }
      for (let reference of nodeData.references) {
        if (reference.node in references) {
          references[reference.node].push(nodeDoc.id);
        } else {
          references[reference.node] = [];
        }
      }
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
      const versionDocs = await versionsColl.get();
      for (let versionDoc of versionDocs.docs) {
        const versionData = versionDoc.data();
        stats.proposals += 1;
        // Only if the version is accepted and it has never been deleted, i.e.,
        // deleted attribute does not exist or it's false:
        if (!versionData.deleted && versionData.accepted) {
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
            if (versionData.proposer in contributors) {
              contributors[versionData.proposer].reputation +=
                versionData.corrects - versionData.wrongs;
            } else {
              if (userInstitutions[versionData.proposer]) {
              contributors[versionData.proposer] = {
                docRef: db.collection("users").doc(versionData.proposer),
                reputation: versionData.corrects - versionData.wrongs,
              };
            }
            }
            if (userInstitutions[versionData.proposer] in institutions) {
              institutions[userInstitutions[versionData.proposer]].reputation +=
              roundNum(versionData.corrects - versionData.wrongs);
            } else {
              console.log({ proposer: versionData.proposer, userInstitution: userInstitutions[versionData.proposer] });
              if (userInstitutions[versionData.proposer]) {
                const institutionDocs = await db
                  .collection("institutions")
                  .where("name", "==", userInstitutions[versionData.proposer])
                  .get();
                if (institutionDocs.docs.length > 0) {
                  institutions[userInstitutions[versionData.proposer]] = {
                    docRef: db
                      .collection("institutions")
                      .doc(institutionDocs.docs[0].id),
                    reputation: versionData.corrects - versionData.wrongs,
                  };
                }
              }
            }
          }
        }
      }

      for (let nodeId in nodesUpdates) {
        if (
          nodesUpdates[nodeId].contributors &&
          nodesUpdates[nodeId].institutions &&
          nodesUpdates[nodeId].contribNames &&
          nodesUpdates[nodeId].institNames
        ) {
          await batchUpdate(nodesUpdates[nodeId].nodeRef, {
            contributors: nodesUpdates[nodeId].contributors,
            institutions: nodesUpdates[nodeId].institutions,
            contribNames: nodesUpdates[nodeId].contribNames,
            institNames: nodesUpdates[nodeId].institNames,
          });
        }
      }
      for (let contributorId in contributors) {
        if (contributors[contributorId].reputation) {
          await batchUpdate(contributors[contributorId].docRef, {
            totalPoints: roundNum(contributors[contributorId].reputation),
          });
        }
      }
      for (let institutionName in institutions) {
        console.log(
          "reputaion Line 416",
          institutions[institutionName].reputation
        );
        if (institutions[institutionName].reputation) {
     
          await batchUpdate(institutions[institutionName].docRef, {
            totalPoints: roundNum(institutions[institutionName].reputation),
          });
        }
      }
    }
    stats.links = Math.round(stats.links);
    const statRef = db.collection("stats").doc();
    await batchSet(statRef, stats);
    await commitBatch();
    console.log("Done");
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};

