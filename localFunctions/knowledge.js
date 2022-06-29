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
