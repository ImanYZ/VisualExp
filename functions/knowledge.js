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
exports.assignNodeContributorsAndInstitutions = async (context) => {
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
        // We need to add the nodeRef to be able to update the node at the end.
        nodesUpdates[versionData.node] = {
          nodeRef: versionsColl.doc(versionDoc.id),
        };
        // We should add the proposer's id and institution
        // to the contributors and institutions arrays in the corresponding node.
        const nodeRef = db.collection("nodes").doc(versionData.node);
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
        if (
          !(versionData.proposer in nodesUpdates[versionData.node].contributors)
        ) {
          nodesUpdates[versionData.node].contributors[versionData.proposer] = {
            fullname: versionData.fullname,
            imageUrl: versionData.imageUrl,
            reputation: 0,
          };
          if (
            !(
              userInstitutions[versionData.proposer] in
              nodesUpdates[versionData.node].institutions
            )
          ) {
            nodesUpdates[versionData.node].institutions[
              userInstitutions[versionData.proposer]
            ] = {
              reputation: 0,
            };
          }
        }
        nodesUpdates[versionData.node].contributors[
          versionData.proposer
        ].reputation += versionData.corrects - versionData.wrongs;
        nodesUpdates[versionData.node].institutions[
          userInstitutions[versionData.proposer]
        ].reputation += versionData.corrects - versionData.wrongs;
      }
    }
    for (nodeId in nodesUpdates) {
      await batchUpdate(nodesUpdates[nodeId].nodeRef, {
        contributors: nodesUpdates[nodeId].contributors,
        institutions: nodesUpdates[nodeId].institutions,
      });
    }
    await commitBatch();

    return null;
  } catch (err) {
    console.log({ err });
    return null;
  }
};
