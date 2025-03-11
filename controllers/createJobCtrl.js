const createJobModel = require("../models/createJob");
// const sendEmail = require('../middlewares/uploadMiddleware')
// const fs = require('fs');

const { sendEmailWithAttachment } = require("../utils/emailService");
const nodemailer = require("nodemailer");

const multer = require("multer");
const path = require("path");

// 🔵 Create a New Job
exports.createJob = async (req, res) => {
  const {
    job_title,
    location,
    min_experience,
    max_experience,
    min_salary,
    max_salary,
    description,
  } = req.body;

  try {
    const job = new createJobModel({
      job_title,
      location,
      min_experience,
      max_experience,
      min_salary,
      max_salary,
      description,
    });
    await job.save();
    res.status(201).json({
      success: true,
      message: "Job created successfully.",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create job.",
      error: error.message,
    });
  }
};

// 🟢 Fetch All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await createJobModel.find();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve jobs.",
      error: error.message,
    });
  }
};

// 🟣 Submit Resume and Send via Email
// exports.submitResume = async (req, res) => {
//   const { email, name, mobile_number, service_location, query } = req.body;
//   const resumeFile = req.file;

//   if (!resumeFile) {
//     return res.status(400).json({ status: "error", message: "Resume file is required." });
//   }

//   const message = `
//     New Job Application Received:

//     Name: ${name}
//     Email: ${email}
//     Mobile Number: ${mobile_number}
//     Service Location: ${service_location}
//     Query: ${query}
//   `;

//   const attachment = {
//     filename: resumeFile.originalname,
//     path: resumeFile.path,
//   };

//   try {
//     await sendEmail({
//       subject: 'New Job Application',
//       text: message,
//       attachments: [attachment],
//     });

//     // Optional: Delete the resume file after sending email
//     fs.unlinkSync(resumeFile.path);

//     res.status(200).json({
//       status: "success",
//       message: "Resume submitted and sent via email successfully.",
//     });

//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: "Failed to send resume via email.",
//       error: error.message,
//     });
//   }
// };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

exports.submitResume = async (req, res) => {
  // try {
  //     const { email, name, mobile_number, service_location, query } = req.body;

  //     if (!req.file) {
  //         return res.status(400).json({ message: 'Resume file is required and must be in PDF format.' });
  //     }

  //     await sendEmailWithAttachment({
  //         email,
  //         name,
  //         mobile_number,
  //         service_location,
  //         query,
  //         filePath: req.file.path,
  //         fileName: req.file.originalname,
  //     });

  //     deleteFile(req.file.path);

  //     res.status(200).json({ message: 'Resume submitted successfully. We will contact you shortly.' });
  // } catch (error) {
  //     res.status(500).json({ message: 'An error occurred while submitting the resume.', error: error.message });
  // }
  try {
    const { email, name, mobile_number, service_location, query } = req.body;
    const resume = req.file;

    if (!resume) {
      return res
        .status(400)
        .send({ error: "Resume file is required and must be a PDF." });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Set up email options for company with attachment
    const companyMailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Job Inquiry Submission from ${name}`,
      text: `A new job inquiry has been submitted with the following details:\n\n
      Name: ${name}\n
      Email: ${email}\n
      Mobile Number: ${mobile_number}\n
      Service Location: ${service_location}\n
      Query: ${query}`,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    };

    // Send information email to the company
    await transporter.sendMail(companyMailOptions);
    console.log(
      `Information email sent to company Email id`
    );

    // Send response
    res
      .status(200)
      .send({ message: "Job inquiry submitted successfully with resume." });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({
      error:
        "An error occurred while submitting the inquiry. Please try again later.",
      error: error.message,
    });
  }
};
