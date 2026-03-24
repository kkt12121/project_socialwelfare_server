const express = require("express");
const router = express.Router();
const noticeRepository = require("../../../repositories/notice.repository");
const userRepository = require("../../../repositories/user.repository");
const crypto = require("../../../modules/crypto");
const upload = require("../../../modules/upload");
const uploadImage = require("../../../modules/uploadImage");
const cloudinary = require("../../../config/cloudinary.config");

router.post("/write", crypto.authenticateAccessToken, async (req, res) => {
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

    // content에서 이미지 URL만 추출하기
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const imageUrl = match[1]; // 추출된 URL 주소
      images.push({
        url: imageUrl,
      });
    }

    // 추출된 이미지가 있을 경우에만 이미지 테이블에 저장
    if (images.length > 0) {
      for (let img of images) {
        await noticeRepository.updateNoticeImage(img.url, newNotice.insertId);
      }
    }

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json("data error");
    }

    const noticeInfo = await noticeRepository.getNoticeById(id);

    if (!noticeInfo) {
      return res.status(404).json("noticeInfo error");
    }

    const notice = {
      id: noticeInfo.id,
      title: noticeInfo.title,
      content: noticeInfo.content,
      created_at: noticeInfo.created_at,
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

router.post("/update/:id", crypto.authenticateAccessToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  let images = [];
  const user_id = res.userInfo.id;
  try {
    if (!id) {
      return res.status(400).json("data error");
    }

    const noticeInfo = await noticeRepository.getNoticeById(id);

    if (!noticeInfo) {
      return res.status(404).json("noticeInfo error");
    }

    if (user_id !== noticeInfo.user_id) {
      return res.status(401).json("authorization error");
    }

    await noticeRepository.updateNotice(noticeInfo.id, title, content);

    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgRegex.exec(content)) !== null) {
      const imageUrl = match[1];
      images.push(imageUrl);
    }

    if (images.length > 0) {
      for (let img of images) {
        await noticeRepository.updateNoticeImage(img, noticeInfo.id);
      }

      await noticeRepository.updateNoticeImageVisible(images, noticeInfo.id);
    }

    return res.status(200).json("success");
  } catch (error) {
    console.log(error);
    return res.status(500).json("InternalServerError");
  }
});

router.post("/delete/:id", crypto.authenticateAccessToken, async (req, res) => {
  const { id } = req.params;
  const user_id = res.userInfo.id;
  try {
    if (!id) {
      return res.status(400).json("data error");
    }

    const noticeInfo = await noticeRepository.getNoticeById(id);

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

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }

    const result = await uploadImage(req.file.buffer);

    await noticeRepository.createNoticeImage(
      result.public_id,
      result.secure_url,
    );

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Image upload failed");
  }
});

module.exports = router;
