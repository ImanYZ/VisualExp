

import { admin, db } from "../lib/firestoreServer/admin";

const retrieveAuthenticatedUser = async ({ uname, uid }) => {
  try {
    let query;
    let errorMessage = "";
    if (uname) {
      query = db.doc(`/users/${uname}`);
    } else if (uid) {
      query = db.collection("users").where("userId", "==", uid).limit(1);
    }
    const userDoc = await query.get();
    if ((!uname || !userDoc.exists) && (!uid || !userDoc.docs.length)) {
      errorMessage = "The user does not exist!";
      console.error(errorMessage);
      return { status: 500, data: errorMessage };
    }
    return { status: 500, data: errorMessage };
  } catch (err) {
    console.error(err);
    return { status: 500, data: err.code };
  }
};

const fbAuth = handler => {
  return async (req, res) => {
    try {
      let token = req.headers.authorization || req.headers.Authorization || "";
      token = token.replace("Bearer ", "");
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) return res.status(401).send({ error: "UnAuthorized" });

      const user = decodedToken;

      const { status, data } = await retrieveAuthenticatedUser({ uname: null, uid: user.uid });
      if (status !== 200) return res.status(status).send({ error: data });
      //authenticated

      if (!req.body) req.body = {};
      if (!req.body.data) req.body.data = { ...req.body };

      req.body.data.user = user;
      req.body.data.user.userData = data;
      req.user = user;
      await handler(req, res);
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
};

export default fbAuth;
