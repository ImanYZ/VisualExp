import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { db } from "../lib/admin";
import indexCollection from "./populateIndex";

const getUsersFromFirestore = async () => {
  let users: { name: string }[] = [];
  const usersDocs = await db.collection("users").get();
  for (let userDoc of usersDocs.docs) {
    const userData = userDoc.data();
    const name = `${userData.fname} ${userData.lName}`;
    users.push({ name });
  }

  return users;
};

const fillUsersIndex = async () => {
  const data = await getUsersFromFirestore();
  const fields: CollectionFieldSchema[] = [{ name: "name", type: "string" }];

  await indexCollection("users", fields, data);
};

const main = async () => {
  console.log("Filling users index");
  await fillUsersIndex();
  console.log("End Filling nodes index");
};

main();
