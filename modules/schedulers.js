const noticeRepository = require("../repositories/notice.repository");
const cloudinary = require("../config/cloudinary.config");

exports.cloudinaryDelete = async function () {
  try {
    const noticeImages = await noticeRepository.getAllNoticeImage();

    for (let img of noticeImages) {
      if (img.notice_id === null || img.visible === 0) {
        await cloudinary.uploader.destroy(img.public_id);
        await noticeRepository.deleteNoticeImage(img.id);
      }
    }

    return console.log("cloudinaryDeleteSchedulerDone");
  } catch (error) {
    return console.log(error);
  }
};
