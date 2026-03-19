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

    userInfo = await userRepository.getUserById(req.decoded.id);

    if (!userInfo) {
      return res.status(404).json("userInfo error");
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

const reGenerateAccessToken = async (req, res, next) => {
  try {
    req.decoded = jwt.verify(
      req.headers.authorization,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const token = await userRepository.getUserIdByRefreshToken(
      req.decoded.id,
      req.headers.authorization,
    );

    if (token) {
      return next();
    } else {
      return res.status(401).json("Logout");
    }
  } catch (error) {
    if (error.name == "JsonWebTokenError") {
      return res.status(401).json(error.name);
    } else if (error.name == "TokenExpiredError") {
      return res.status(419).json(error.name);
    }
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateAccessToken,
  reGenerateAccessToken,
};
