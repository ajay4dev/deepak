// src/models/ResumeApplication.js
const mongoose = require("mongoose");

const ResumeApplicationSchema = new mongoose.Schema(
  {
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    email: String,
    name: String,
    mobile_number: Number,
    service_location: String,
    query: String,
    // job_title: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ResumeApplication", ResumeApplicationSchema);
