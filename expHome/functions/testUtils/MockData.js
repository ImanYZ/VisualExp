const { db } = require("../admin_Knowledge");
const isTestEnv = require("./isTestEnv");

const dropCollection = async (path) => {
  if (!isTestEnv()) return;

  await db.runTransaction(async t => {
    const documentsList = await t.get(db.collection(path));

    for (let document of documentsList.docs) {
      await t.delete(document.ref);
    }
  });
};

class MockData {
  constructor(data, collecion) {
    this.data = data;
    this.collecion = collecion;
  }

  getData = () => {
    return this.data
  }

  getCollection = () => {
    return this.collecion;
  }

  populate = async () => {
    await db.runTransaction(async t => {
      for (let document of this.data) {
        let documentRef = db.collection(this.collecion);

        documentRef = document.documentId ? documentRef.doc(document.documentId) : documentRef.doc();

        const documentData = { ...document };
        delete documentData.documentId;
        await t.set(documentRef, documentData);
      }
    });
  };

  clean = async () => {
    await dropCollection(this.collecion);
  };
}

module.exports = MockData;