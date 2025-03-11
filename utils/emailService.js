const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailWithAttachment = async ({
  email,
  name,
  mobile_number,
  service_location,
  query,
  filePath,
  fileName,
}) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "vijayverma192003@gmail.com",
    subject: "New Resume Submission",
    text: `Applicant Details:\nName: ${name}\nEmail: ${email}\nMobile Number: ${mobile_number}\nService Location: ${service_location}\nQuery: ${query}`,
    attachments: [
      {
        filename: fileName,
        path: filePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
