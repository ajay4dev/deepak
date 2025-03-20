const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Access Denied! No token provided.",
      });
    }

    // Decode token & check role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded); //  Debugging ke liye

    req.user = decoded;

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Admins only.",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token! Authentication failed.",
      error: error.message,
    });
  }
};

module.exports = verifyAdmin;
