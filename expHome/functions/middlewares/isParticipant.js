const isParticipant = async (req, res, next) => {
  if(!req.userType === "users") {
    return res.status(401).send({
      message: "Unauthorized"
    })
  }

  return next();
};

module.exports = isParticipant;
