const isResearcher = async (req, res, next) => {
  if(!req.researcher) {
    return res.status(401).send({
      message: "Unauthorized"
    })
  }

  return next();
};

module.exports = isResearcher;
