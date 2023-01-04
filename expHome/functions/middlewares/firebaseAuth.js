const { admin } = require("../admin");

const firebaseAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.Authorization || "";
    token = token.replace("Bearer ", "");
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) return res.status(401).send({ error: "Unauthorized" });
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = firebaseAuth;
