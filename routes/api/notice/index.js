const router = require("express").Router();
const notice = require("./notice.ctrl");

router.post("/write", notice);
router.get("/detail", notice);
router.get("/list", notice);
router.post("/update", notice);
router.post("/delete", notice);

module.exports = router;
