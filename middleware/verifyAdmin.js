const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // 👈 Cookie se token le

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Access Denied! No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
