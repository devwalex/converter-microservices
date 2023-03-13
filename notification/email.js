const nodemailer = require("nodemailer");
require("dotenv/config");

async function sendMail(message) {
  try {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: "Video to Audio Converter <converter@mail.com>",
      to: message.userEmail,
      subject: "Video Converted to Audio Successfully",
      html: `Hello, <br />
      Your video has been converted to audio successfully. Click on the link below to download your audio file. <br /> <br />
      <a href="${process.env.GATEWAY_SVC_ADDRESS}/download/${message.audioFileId}">Download Audio</a>`,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Email Error", error);
  }
}

module.exports = sendMail;
