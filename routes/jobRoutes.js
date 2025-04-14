const express = require("express");
const router = express.Router();

// const authenticateUser = require('../middlewares/authMiddleware');
// const upload = require("../middlewares/uploadMiddleware");
const multer = require("multer");
const path = require("path");

const {
  createJob,
  getAllJobs,
  submitResume,
  updateJob,
  deleteJob,
  getJobById,
  getApplicationsCountByJob,
  getJobApplicationsWithDetails,
} = require("../controllers/createJobCtrl");
const verifyAdmin = require("../middleware/verifyAdmin");

//  POST: Create a New Job (Protected Route)
router.post("/create", createJob);

router.get("/job-applications", getJobApplicationsWithDetails);

//  GET: Fetch All Jobs
router.get("/all", getAllJobs);

router.get("/single/:id", verifyAdmin, getJobById);

router.put("/updateJob/:id", verifyAdmin, updateJob);

// DELETE API
router.delete("/deleteJob/:id", verifyAdmin, deleteJob);

// Configure multer for memory storage
const allowedMimeTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg", // .jpg, .jpeg
  "image/png", // .png
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, JPG, and PNG files are allowed!"));
    }
  },
});

router.post("/submit-resume", upload.single("resume"), submitResume);

router.get("/resume-stats", getApplicationsCountByJob);

module.exports = router;
