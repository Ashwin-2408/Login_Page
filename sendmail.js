const mail = require("nodemailer");
require("dotenv").config();

var transport = mail.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendmail = async () => {
  var info = await transport.sendMail({
    from: "",
    to: "",
    subject: "hi",
    text: "hi",
  });
  console.log("messgae sent" + info.messageId);
};

sendmail();
