
import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    service:'gmail', // true for 465, false for other ports
    auth: {
      user: 'jainsrajan77@gmail.com',
      pass: 'nuwqywjjgcphxprr',
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"Srajan jain" <jainsrajan77@gmail.com> ', // sender address
    to: email, // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;