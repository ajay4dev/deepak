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
} = require("../controllers/createJobCtrl");

// 🟢 POST: Create a New Job (Protected Route)
router.post("/create", createJob);

// 🔵 GET: Fetch All Jobs
router.get("/all", getAllJobs);

// 🟣 POST: Submit Resume and Send via Email (Protected Route)

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });

// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         if (ext !== ".pdf") {
//             return cb(new Error("Only PDF files are allowed!"));
//         }
//         cb(null, true);
//     },
// });

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname));
//     },
//   });

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

module.exports = router;
