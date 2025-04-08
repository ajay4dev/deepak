const createJobModel = require("../models/createJob");
const nodemailer = require("nodemailer");
const ResumeApplication = require("../models/submitResumeModel");

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
    start_time,
    end_time,
    number_of_openings,
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
      start_time,
      end_time,
      number_of_openings,
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
    const jobs = await createJobModel.find().sort({ createdAt: -1 });
    // console.log(jobs);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve jobs.",
      error: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await createJobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job fetched successfully.",
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to fetch job.",
      error: error.message,
    });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const {
    job_title,
    location,
    min_experience,
    max_experience,
    min_salary,
    max_salary,
    description,
    start_time,
    end_time,
    number_of_openings,
  } = req.body;

  try {
    // Find the job by ID and update it
    const updatedJob = await createJobModel.findByIdAndUpdate(
      id,
      {
        job_title,
        location,
        min_experience,
        max_experience,
        min_salary,
        max_salary,
        description,
        start_time,
        end_time,
        number_of_openings,
      },
      { new: true, runValidators: true } // Return the updated document
    );

    // If job not found
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: updatedJob,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update job.",
      error: error.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await createJobModel.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete job.",
      error: error.message,
    });
  }
};

exports.submitResume = async (req, res) => {
  try {
    const {
      email,
      name,
      mobile_number,
      service_location,
      query,
      // job_title
    } = req.body;
    const resume = req.file;

    // Check for resume file
    if (!resume || resume.mimetype !== "application/pdf") {
      return res
        .status(400)
        .send({ error: "Resume file is required and must be a PDF." });
    }

    // Save to MongoDB
    await ResumeApplication.create({
      email,
      name,
      mobile_number,
      service_location,
      query,
      // job_title,
    });

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Company email
    const companyMailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Job Inquiry Submission from ${name}`,
      text: `A new job inquiry has been submitted with the following details:\n\n
Name: ${name}\nEmail: ${email}\nMobile Number: ${mobile_number}\nService Location: ${service_location}\nQuery: ${query}`,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    };

    // Confirmation email to applicant
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank You for Your Job Inquiry, ${name}!`,
      text: `Dear ${name},\n\nThank you for reaching out to us with your job inquiry.\n\nHere are the details we received:\n
Name: ${name}\nEmail: ${email}\nMobile Number: ${mobile_number}\nService Location: ${service_location}\nQuery: ${query}\n\n
We will review your submission and get back to you shortly.\n\nBest Regards,\nTeam`,
    };

    // Send emails
    await transporter.sendMail(companyMailOptions);
    await transporter.sendMail(userMailOptions);

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

exports.getApplicationsCountByJob = async (req, res) => {
  try {
    const result = await ResumeApplication.aggregate([
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          job_title: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      message: "Applications count by job title",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching job stats:", error);
    res.status(500).json({
      message: "Failed to fetch applications data",
      error: error.message,
    });
  }
};
