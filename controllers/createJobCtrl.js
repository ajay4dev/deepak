const createJobModel = require("../models/createJob");
const nodemailer = require("nodemailer");

//  Create a New Job
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

//  Fetch All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await createJobModel.find();
    console.log(jobs);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve jobs.",
      error: error.message,
    });
  }
};

exports.submitResume = async (req, res) => {
  try {
    const { email, name, mobile_number, service_location, query } = req.body;
    const resume = req.file;

    // Check if resume file is provided and is a PDF
    if (!resume || resume.mimetype !== "application/pdf") {
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
      replyTo: email,
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
    console.log(`Information email sent to company Email id`);

    // Send response
    res
      .status(200)
      .send({ message: "Job inquiry submitted successfully with resume." });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({
      error:
        "An error occurred while submitting the inquiry. Please try again later.",
      details: error.message,
    });
  }
};
