const { admin, db } = require("../admin");

const firebaseAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.Authorization || "";
    token = token.replace("Bearer ", "");
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) return res.status(401).send({ error: "Unauthorized" });
    req.user = decodedToken;

    const userCollections = ["users", "usersStudentCoNoteSurvey", "usersInstructorCoNoteSurvey"];

    for(const userCollection of userCollections) {
      const users = await db.collection("users").where("email", "==", decodedToken.email).get();
      if(users.docs.length) {
        req.userType = userCollection;
        req.userData = users.docs[0].data();
        req.userData.fullname = users.docs[0].id;
        break;
      }
    }

    const researchers = await db.collection("researchers").where("email", "==", req.user.email).get();
    if(researchers.docs.length) {
      req.researcher = researchers.docs[0].data();
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = firebaseAuth;
