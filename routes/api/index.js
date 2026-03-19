const router = require("express").Router();

const user = require("./user");
const notice = require("./notice");

router.use("/user", user);
router.use("/notice", notice);

module.exports = router;
