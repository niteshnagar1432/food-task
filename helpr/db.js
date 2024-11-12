const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')
const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Please provide a valid token" });
    }
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { connectDB, authMiddleware };
