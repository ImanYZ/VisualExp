

const writeTransaction = async (transactionWrites, t) => {
  for (const transactionWrite of transactionWrites) {
    if (transactionWrite.type === "update") {
      await t.update(transactionWrite.refObj, transactionWrite.updateObj);
    } else if (transactionWrite.type === "set") {
      await t.set(transactionWrite.refObj, transactionWrite.updateObj);
    } else if (transactionWrite.type === "delete") {
      await t.delete(transactionWrite.refObj);
    }
  }
};

module.exports = writeTransaction;
