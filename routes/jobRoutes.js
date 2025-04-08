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
} = require("../controllers/createJobCtrl");
const verifyAdmin = require("../middleware/verifyAdmin");

//  POST: Create a New Job (Protected Route)
router.post("/create", createJob);

//  GET: Fetch All Jobs
router.get("/all", getAllJobs);

router.get("/single/:id", verifyAdmin, getJobById);

router.put("/updateJob/:id", verifyAdmin, updateJob);

// DELETE API
router.delete("/deleteJob/:id", verifyAdmin, deleteJob);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

router.post("/submit-resume", upload.single("resume"), submitResume);

router.get("/resume-stats", getApplicationsCountByJob);

module.exports = router;
