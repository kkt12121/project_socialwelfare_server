const express = require("express");
const router = express.Router();
const userRepository = require("../../../repositories/user.repository");
const crypto = require("../../../modules/crypto");
const mailService = require("../../../modules/nodemailer");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { name, birth, email, password, phone } = req.body;
  try {
    if (!name || !birth || !email || !password || !phone) {
      return res.status(400).json("data error");
    }

    const emailCheck = await userRepository.getUserByEmail(email);

    if (emailCheck) {
      return res.status(409).json("email duplicate");
    }

    await userRepository.createUser(name, birth, email, password, phone);

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json("data error");
    }

    const findUser = await userRepository.getUserByEmail(email);

    if (!findUser) {
      return res.status(404).json("userinfo error");
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(404).json("password error");
    }

    const accessToken = await crypto.generateAccessToken(
      findUser.id,
      findUser.email,
    );

    const refreshToken = await crypto.generateRefreshToken(
      findUser.id,
      findUser.email,
    );

    await userRepository.updateUser(findUser.id, {
      refreshToken,
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.post("/forgotPw", async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json("data error");
    }

    const findUser = await userRepository.getUserByEmail(email);

    if (!findUser) {
      return res.status(404).json("userinfo error");
    }

    const resetToken = crypto.randomToken();

    const expires = new Date(Date.now() + 3600000);

    await userRepository.updateUser(findUser.id, {
      reset_token: resetToken,
      reset_token_expires: expires,
    });

    const resetLink = `${process.env.SERVICE_URI}/reset-password?token=${resetToken}`;

    await mailService.sendResetEmail(email, resetLink);

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.post("/resetPw", async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token) {
      return res.status(400).json("token error");
    }

    if (!password) {
      return res.status(400).json("data error");
    }

    const findUser = await userRepository.getUserTokenVerify(token);

    if (!findUser) {
      return res.status(404).json("invalid or expired link");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRepository.updateUser(findUser.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.get("/userInfo", crypto.authenticateAccessToken, async (req, res) => {
  const { id } = req.decoded;
  try {
    let userInfo = await userRepository.getUserById(id);

    if (!userInfo) {
      return res.status(404).json("userInfo error");
    }

    return res.status(200).json(userInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.get("/accessToken", crypto.reGenerateAccessToken, async (req, res) => {
  try {
    const findUser = await userRepository.getUserByEmail(req.decoded.email);

    if (!findUser) {
      return res.status(404).json("userInfo error");
    }

    const accessToken = await crypto.generateAccessToken(
      findUser.id,
      findUser.email,
    );

    if (accessToken) {
      return res.status(200).json({ accessToken });
    } else {
      return res.status(500).json("token generate error");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

module.exports = router;
