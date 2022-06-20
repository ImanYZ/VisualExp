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
exports.assignNodeContributorsInstitutionsStats = async (req, res) => {
  try {
    // First get the list of all users and create an Object to map their ids to their
    // institution names.
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
              contributors[versionData.proposer] = {
                docRef: db.collection("users").doc(versionData.proposer),
                reputation: versionData.corrects - versionData.wrongs,
              };
            }
            if (userInstitutions[versionData.proposer] in institutions) {
              institutions[userInstitutions[versionData.proposer]] +=
                versionData.corrects - versionData.wrongs;
            } else {
              const institutionDocs = await db
                .collection("institutions")
                .where(
                  "name",
                  "==",
                  institutions[userInstitutions[versionData.proposer]]
                )
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
      for (let nodeId in nodesUpdates) {
        await batchUpdate(nodesUpdates[nodeId].nodeRef, {
          contributors: nodesUpdates[nodeId].contributors,
          institutions: nodesUpdates[nodeId].institutions,
          contribNames: nodesUpdates[nodeId].contribNames,
          institNames: nodesUpdates[nodeId].institNames,
        });
      }
      for (let contributorId in contributors) {
        await batchUpdate(contributors[contributorId].docRef, {
          totalPoints: contributors[contributorId].reputation,
        });
      }
      for (let institutionName in institutions) {
        await batchUpdate(institutions[institutionName].docRef, {
          totalPoints: institutions[institutionName].reputation,
        });
      }
    }
    stats.links = Math.round(stats.links);
    const statRef = db.collection("stats").doc();
    await batchSet(statRef, stats);
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
exports.updateInstitutions = async (context) => {
  try {
    const rawdata = fs.readFileSync(
      __dirname + "/datasets/edited_universities.json"
    );
    const institutionCountries = {};
    for (let institObj of JSON.parse(rawdata)) {
      institutionCountries[institObj.name] = institObj.country;
    }
    let userDocs = await db.collection("users").get();
    userDocs = [...userDocs.docs];
    for (let userDoc of userDocs) {
      const userData = userDoc.data();
      if (!userData.institUpdated) {
        const domainName = userData.email.match("@(.+)$")[0];
        const instQuery = db
          .collection("institutions")
          .where("name", "==", userData.deInstit)
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
            const country =
              userData.deInstit in institutionCountries
                ? institutionCountries[userData.deInstit]
                : "";
            let response = await axios.get(
              encodeURI(
                "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=" +
                  userData.deInstit
              )
            );
            let geoLoc;
            if (
              "results" in response.data &&
              Array.isArray(response.data.results) &&
              response.data.results.length > 0 &&
              "geometry" in response.data.results[0]
            ) {
              geoLoc = response.data.results[0].geometry.location;
            } else {
              response = await axios.get(
                encodeURI(
                  "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=" +
                    userData.deInstit +
                    " Education"
                )
              );
              if (
                "results" in response.data &&
                Array.isArray(response.data.results) &&
                response.data.results.length > 0 &&
                "geometry" in response.data.results[0]
              ) {
                geoLoc = response.data.results[0].geometry.location;
              } else {
                geoLoc = {
                  lng: "",
                  lat: "",
                };
                console.log({
                  institution: userData.deInstit,
                  geocodeResponse: response.data,
                });
              }
            }
            t.set(instRef, {
              country,
              lng: geoLoc.lng,
              lat: geoLoc.lat,
              logoURL: encodeURI(
                "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/" +
                  userData.deInstit +
                  ".png"
              ),
              domains: [domainName],
              name: userData.deInstit,
              users: [userDoc.id],
              usersNum: 1,
            });
          }
          const userRef = db.collection("users").doc(userDoc.id);
          t.update(userRef, { institUpdated: true });
        });
      }
    }
    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};
