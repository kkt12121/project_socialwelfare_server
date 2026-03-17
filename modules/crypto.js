const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");

const generateAccessToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60m",
  });
};
const generateRefreshToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "180 days",
  });
};

const authenticateAccessToken = async (req, res, next) => {
  let userInfo;
  try {
    req.decoded = jwt.verify(
      req.headers.authorization,
      process.env.ACCESS_TOKEN_SECRET,
    );

    userInfo = await userRepository.getUserByEmail(req.decoded.email);

    if (!userInfo) {
      return res.status(404).json("userInfoError");
    } else {
      res.userInfo = userInfo;
    }

    return next();
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(401).json(error.name);
    } else if (error.name == "TokenExpiredError") {
      return res.status(401).json(error.name);
    }

    console.log(error);

    return res.status(500).json("InternalServerError");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateAccessToken,
};
