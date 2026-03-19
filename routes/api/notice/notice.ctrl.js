const express = require("express");
const router = express.Router();
const noticeRepository = require("../../../repositories/notice.repository");
const userRepository = require("../../../repositories/user.repository");
const crypto = require("../../../modules/crypto");
const upload = require("../../../modules/upload");
const uploadImage = require("../../../modules/uploadImage");
const cloudinary = require("../../../config/cloudinary.config");

router.post(
  "/write",
  upload.array("image"),
  crypto.authenticateAccessToken,
  async (req, res) => {
    const { title, content } = req.body;
    let images = [];
    const user_id = res.userInfo.id;
    try {
      const superUser = await userRepository.getUserById(user_id);

      if (!superUser || superUser.super !== 1) {
        return res.status(401).json("authorization error");
      }

      if (!title || !content) {
        return res.status(400).json("data error");
      }

      const newNotice = await noticeRepository.createNotice(
        user_id,
        title,
        content,
      );

      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const result = await uploadImage(file.buffer);

          images.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        await noticeRepository.createNoticeImage(newNotice.insertId, images);
      }

      return res.status(200).json("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json("InternalServerError");
    }
  },
);

router.get("/detail", async (req, res) => {
  const { index } = req.query;
  const imageArr = [];
  try {
    if (!index) {
      return res.status(400).json("data error");
    }

    const noticeInfo = await noticeRepository.getNoticeById(index);

    if (!noticeInfo) {
      return res.status(404).json("noticeInfo error");
    }

    const imageInfo = await noticeRepository.getNoticeImageByNoticeId(
      noticeInfo.id,
    );

    for (let img of imageInfo) {
      let imgInfo = {
        id: img.id,
        image_url: img.image_url,
      };

      imageArr.push(imgInfo);
    }

    const notice = {
      id: noticeInfo.id,
      title: noticeInfo.title,
      content: noticeInfo.content,
      created_at: noticeInfo.created_at,
      images: imageArr,
    };

    return res.status(200).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.get("/list", async (req, res) => {
  try {
    const noticeInfos = await noticeRepository.getAllNotices();

    return res.status(200).json(noticeInfos);
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.post(
  "/update",
  upload.array("image"),
  crypto.authenticateAccessToken,
  async (req, res) => {
    const { index, title, content, deleteImages } = req.body;
    let images = [];
    const user_id = res.userInfo.id;
    try {
      if (!index) {
        return res.status(400).json("data error");
      }

      const noticeInfo = await noticeRepository.getNoticeById(index);

      if (!noticeInfo) {
        return res.status(404).json("noticeInfo error");
      }

      if (user_id !== noticeInfo.user_id) {
        return res.status(401).json("authorization error");
      }

      await noticeRepository.updateNotice(noticeInfo.id, title, content);

      /* 삭제할 이미지가 있을 시 */
      const parseDeleteImages = JSON.parse(deleteImages);

      if (parseDeleteImages.length > 0) {
        for (let idx of parseDeleteImages) {
          const deleteImgInfo = await noticeRepository.getNoticeImageById(idx);

          await cloudinary.uploader.destroy(deleteImgInfo.public_id);

          await noticeRepository.deleteNoticeImage(idx);
        }
      }

      /* 추가할 이미지가 있을 시 */
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const result = await uploadImage(file.buffer);

          images.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        await noticeRepository.createNoticeImage(noticeInfo.id, images);
      }

      return res.status(200).json("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json("InternalServerError");
    }
  },
);

router.post("/delete", crypto.authenticateAccessToken, async (req, res) => {
  const { index } = req.body;
  const user_id = res.userInfo.id;
  try {
    if (!index) {
      return res.status(400).json("data error");
    }

    const noticeInfo = await noticeRepository.getNoticeById(index);

    if (!noticeInfo) {
      return res.status(404).json("noticeInfo error");
    }

    if (user_id !== noticeInfo.user_id) {
      return res.status(401).json("authorization error");
    }

    /* 삭제할 이미지가 있을 시 */
    const imgInfos = await noticeRepository.getNoticeImageByNoticeId(
      noticeInfo.id,
    );

    if (imgInfos.length > 0) {
      for (let img of imgInfos) {
        await cloudinary.uploader.destroy(img.public_id);

        await noticeRepository.deleteNoticeImage(img.id);
      }
    }

    await noticeRepository.deleteNotice(noticeInfo.id);

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

module.exports = router;
