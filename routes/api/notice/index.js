const router = require("express").Router();
const notice = require("./notice.ctrl");

router.post("/write", notice);
router.get("/detail/:id", notice);
router.get("/list", notice);
router.post("/update/:id", notice);
router.post("/delete/:id", notice);
router.post("/upload", notice);

module.exports = router;
