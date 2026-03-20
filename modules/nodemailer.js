const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PW,
  },
});

const sendResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "[가담재가복지센터] 비밀번호 재설정 안내입니다.",
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 450px; margin: 0 auto; padding: 40px 20px; border: 1px solid #f0f0f0; border-radius: 20px; text-align: center;">
        <h2 style="color: #059669; font-size: 24px; margin-bottom: 20px;">비밀번호 재설정</h2>
        <p style="color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          안녕하세요. 가담재가복지센터입니다.<br/>
          아래 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요.
        </p>
        <a href="${resetLink}" style="display: inline-block; background-color: #059669; color: white; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
          비밀번호 변경하기
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          보안을 위해 이 링크는 1시간 동안만 유효합니다.<br/>
          본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
