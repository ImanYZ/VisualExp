const isAdmin = async (req, res, next) => {
    if(!req.admin) {
      return res.status(401).send({
        message: "Unauthorized"
      })
    }
  
    return next();
  };
  
  module.exports = isAdmin;
  