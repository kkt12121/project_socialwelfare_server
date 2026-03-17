const router = require("express").Router();
const user = require("./user.ctrl");

router.post("/register", user);
router.post("/login", user);
router.get("/userInfo", user);

module.exports = router;
