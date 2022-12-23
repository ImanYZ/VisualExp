const { getAuth } = require("firebase-admin/auth");
const { admin } = require("../admin_Knowledge");
const isTestEnv = require("./isTestEnv");

const deleteAllUsers = async () => {
  if (!isTestEnv()) return;

  const auth = getAuth(admin);
  const list = await auth.listUsers();
  await auth.deleteUsers(list.users.map(u => u.uid));
};

module.exports = deleteAllUsers;