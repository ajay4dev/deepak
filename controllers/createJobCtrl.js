const createJobModel = require("../models/createJob");
const nodemailer = require("nodemailer");
const ResumeApplication = require("../models/submitResumeModel");
const mongoose = require("mongoose");

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

  // Hide salary if needed
  if (createJobModel.isSalaryHidden) {
    delete createJobModel.min_salary;
    delete createJobModel.max_salary;
  }

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

exports.getJobApplicationsWithDetails = async (req, res) => {
  try {
    const result = await createJobModel.aggregate([
      {
        $lookup: {
          from: "resumeapplications", // DOUBLE CHECK THIS NAME
          localField: "_id",
          foreignField: "job_id",
          as: "applicants",
        },
      },
      {
        $addFields: {
          applicants_count: { $size: "$applicants" },
        },
      },
      {
        $project: {
          job_title: 1,
          location: 1,
          number_of_openings: 1,
          applicants_count: 1,
          applicants: {
            $map: {
              input: "$applicants",
              as: "applicant", // consistent spelling
              in: {
                name: "$$applicant.name",
                email: "$$applicant.email",
                mobile_number: "$$applicant.mobile_number",
                service_location: "$$applicant.service_location",
                submitted_at: "$$applicant.submitted_at", // check field name
              },
            },
          },
        },
      },
    ]);

    console.log("Aggregation result:", result);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Fetch All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const result = await createJobModel.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "resumeapplications", // Verify this matches your collection name
          localField: "_id",
          foreignField: "job_id",
          as: "applicants",
        },
      },
      {
        $addFields: {
          applicants_count: { $size: "$applicants" },
        },
      },
      {
        $project: {
          job_title: 1,
          location: 1,
          min_experience: 1,
          max_experience: 1,
          min_salary: 1,
          max_salary: 1,
          description: 1,
          start_time: 1,
          end_time: 1,
          number_of_openings: 1,
          createdAt: 1,
          applicants_count: 1,
          applicants: {
            $map: {
              input: "$applicants",
              as: "applicant",
              in: {
                name: "$$applicant.name",
                email: "$$applicant.email",
                mobile_number: "$$applicant.mobile_number",
                service_location: "$$applicant.service_location",
                submitted_at: "$$applicant.submitted_at",
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
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
    const { job_id, email, name, mobile_number, service_location, query } =
      req.body;

    // Ensure job_id is provided and valid
    if (!mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ error: "Invalid job ID format" });
    }

    // Check if job exists
    const job = await createJobModel.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const resume = req.file;

    // Validate resume file
    if (!resume || resume.mimetype !== "application/pdf") {
      return res
        .status(400)
        .send({ error: "Resume file is required and must be a PDF." });
    }

    // Save application to DB
    await ResumeApplication.create({
      job_id,
      email,
      name,
      mobile_number,
      service_location,
      query,
    });

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to company
    const companyMailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Job Inquiry Submission from ${name}`,
      text: `A new job inquiry has been submitted with the following details:\n\nName: ${name}\nEmail: ${email}\nMobile Number: ${mobile_number}\nService Location: ${service_location}\nQuery: ${query}`,
      attachments: [
        {
          filename: resume.originalname,
          content: resume.buffer,
        },
      ],
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank You for Your Job Inquiry, ${name}!`,
      text: `Dear ${name},\n\nThank you for reaching out to us with your job inquiry.\n\nHere are the details we received:\nName: ${name}\nEmail: ${email}\nMobile Number: ${mobile_number}\nService Location: ${service_location}\nQuery: ${query}\n\nWe will review your submission and get back to you shortly.\n\nBest Regards,\nTeam`,
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
