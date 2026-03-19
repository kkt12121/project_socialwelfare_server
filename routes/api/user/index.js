const router = require("express").Router();
const user = require("./user.ctrl");

router.post("/register", user);
router.post("/login", user);
router.get("/userInfo", user);
router.get("/accessToken", user);

module.exports = router;
