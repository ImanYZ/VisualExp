const {
  admin,
  db,
  commitBatch,
  batchSet,
  batchUpdate,
  batchDelete,
} = require("./admin_Knowledge");
const { getTypedCollections } = require("./getTypedCollections");

// On 1Cademy.com nodes do not have their list of contributors and institutions assigned to them.
// We should run this function every 25 hours in a PubSub to assign these arrays.
exports.assignNodeContributorsAndInstitutions = async (req, res) => {
  try {
    // First get the list of all users and create an Object to map their ids to their
    // institution names.
    const userInstitutions = {};
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      const userData = userDoc.data();
      userInstitutions[userDoc.id] = userData.deInstit;
    }
    // We should retrieve all the accepted versions for all types of nodes.
    const nodeTypes = ["Concept", "Relation", "Question", "Reference", "Idea"];
    for (let nodeType of nodeTypes) {
      console.log("Started nodeType: ", nodeType);
      const { versionsColl } = getTypedCollections(db, nodeType);
      const versionDocs = await versionsColl
        .where("accepted", "==", true)
        .get();
      for (let versionDoc of versionDocs.docs) {
        const versionRef = versionsColl.doc(versionDoc.id);
        const versionData = versionDoc.data();
        // Only for those accepted versions that we previously did not add their
        // institution and contriputor to the node:
        if (
          !("addedInstitContris" in versionData) ||
          !versionData.addedInstitContris
        ) {
          // We should add the proposer's id and institution
          // to the contributors and institutions arrays in the corresponding node.
          const nodeRef = db.collection("nodes").doc(versionData.node);
          const nodeDoc = await nodeRef.get();
          const nodeData = nodeDoc.data();
          let institutions = [];
          if ("institutions" in nodeData) {
            institutions = nodeData.institutions;
          } else {
            institutions = [];
          }
          let contributors = [];
          if ("contributors" in nodeData) {
            contributors = nodeData.contributors;
          } else {
            contributors = [];
          }
          // Only update the nodes for which we have not already added this proposer
          // as a contributor. Note that a user may have multiple accepted proposals
          // on a node.
          if (!contributors.includes(versionData.fullname)) {
            contributors.push(versionData.fullname);
            if (
              !institutions.includes(userInstitutions[versionData.proposer])
            ) {
              institutions.push(userInstitutions[versionData.proposer]);
            }
            console.log({
              versionId: versionDoc.id,
              contributors,
              institutions,
            });
            // Because in every iteration we have to check whether the proposer and
            // their institution exist in the node document, we cannot use batch
            // writes here.
            await nodeRef.update({
              institutions,
              contributors,
            });
          }
          // Mark in the version doc that we already added the institutions
          // and contributors.
          await versionRef.update({
            addedInstitContris: true,
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
