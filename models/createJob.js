const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  job_title: {
    type: String,
    required: true,
    default: "Software Engineer"
  },
  location: {
    type: String,
    required: true,
    default: "Remote"
  },
  min_experience: {
    type: Number,
    required: true,
    default: 0
  },
  max_experience: {
    type: Number,
    required: true,
    default: 5
  },
  min_salary: {
    type: Number,
    required: true,
    default: 30000
  },
  max_salary: {
    type: Number,
    required: true,
    default: 100000
  },
  description: {
    type: String,
    required: true,
    default: "This is a job description for the role of Software Engineer."
  },
  posted_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
