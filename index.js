require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB, authMiddleware } = require("./helpr/db");
const Order = require("./Model/Order");
const userModel = require("./Model/userModel");
const app = express();
connectDB();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  try {
    res.json({
      status: true,
      message: "Server Is Alive.",
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
});

app.post("/api/create-order", authMiddleware, async (req, res) => {
  try {
    let { items, totalPrice, itemCount } = req.body;
    let { email } = req.user;

    let user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        status: false,
        message: "user not found.",
      });
    }

    if (!totalPrice && !itemCount) {
      return res.json({
        status: false,
        message: "Total Price and Item Count are required.",
      });
    }

    if (!items && items.length === 0) {
      return res.json({
        status: false,
        message: "Please add items to the order",
      });
    }

    let createdOrder = await Order.create({
      userId: user._id,
      items,
      totalPrice,
      itemCount,
    });

    if (createdOrder) {
      return res.json({
        status: true,
        message: "Order Created Successfully",
      });
    } else {
      return res.json({
        status: false,
        message: "Failed to create order",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
});

app.post("/api/user/sign-up", async (req, res) => {
  try {
    let { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.json({
        status: false,
        message: "All fields are required.",
      });
    }

    const newUser = await userModel.create({
      name,
      email,
      password: bcrpt.hashSync(password, 10),
    });

    if (newUser) {
      let token = jwt.sign(
        { email: newUser.email, name: newUser.name },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({
        status: true,
        message: "User created successfully",
        data: { name: newUser.name, email: newUser.email, token },
      });
    } else {
      res.json({
        status: false,
        message: "Failed to create user",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
});

app.post("/api/user/sign-in", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        status: false,
        message: "All fields are required",
      });
    }

    let authUser = await userModel.findOne({ email });

    if (authUser) {
      let isMatch = bcrpt.compareSync(password, authUser.password);
      if (isMatch) {
        let token = jwt.sign(
          { email: authUser.email, name: authUser.name },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({
          status: true,
          message: "User logged in successfully",
          data: { name: authUser.name, email: authUser.email, token },
        });
      } else {
        res.json({
          status: false,
          message: "Invalid auth data.",
        });
      }
    }
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
});

app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    let { name, email } = req.user;
    let user = await userModel.findOne({ email });
    if (user) {
      res.json({
        status: true,
        message: "User profile found",
        user: { name, email, created_at: user.created_at },
      });
    } else {
      res.json({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running on Port : ${process.env.PORT}`);
});
