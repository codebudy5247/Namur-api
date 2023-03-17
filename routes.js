const express = require("express");
const router = express.Router();
const UserModel = require("./Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const Auth = require("./auth");

//Test
router.get("/", async (req, res) => {
  res.send("API is up && running!!");
});

//======================================= AUTHENTICATION ===========================================
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

//Signup {Generate OTP}
router.post("/register", async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    if (!phone_number)
      return res.status(500).json({ message: "Enter phone number" });
    const olduser = await UserModel.findOne({ phone_number });
    if (olduser)
      return res.status(400).json({ message: "User already exists" });
    // Generate an OTP using the Twilio API
    const otp = Math.floor(100000 + Math.random() * 900000);
    client.messages
      .create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+${phone_number}`,
      })
      .then((message) => {
        console.log(message.sid, phone_number);
      })
      .catch((error) => console.log(error));

    // Save the user document
    const user = new UserModel({ password: hashedPassword, phone_number, otp });
    await user.save();
    res.json({ message: "OTP sent successfully", User: user });
  } catch (error) {
    res.status(500).json({
      message: err,
    });
  }
});

//Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { phone_number } = req.body;
    const user = await UserModel.findOne({ phone_number });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    client.messages
      .create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+${phone_number}`,
      })
      .then((message) => {
        console.log(message);
        let updateFields = {};
        updateFields.otp = otp;
        let updatedUser = UserModel.findOneAndUpdate(
          { _id: user._id },
          { $set: updateFields },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ message: "OTP sent successfully", User: updatedUser });
      })
      .catch((error) => console.log(error));
  } catch (error) {
    res.status(500).json({
      message: err,
    });
  }
});

//Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    const user = await UserModel.findOne({ phone_number });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    const token = jwt.sign({ phone: phone_number, id: user._id }, "secret", {
      expiresIn: "1h",
    });
    let updateFields = {};
    updateFields.phone_number_verified = true;
    let updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({
      message: "OTP verified successfully",
      User: updatedUser,
      AuthToken: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: err,
    });
  }
});

//Select Language
router.post("/select-lang", Auth, async (req, res) => {
  const { lang } = req.body;
  try {
    let user = req.user;
    let updateFields = {};
    updateFields.language = lang;
    let updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send("Success");
  } catch (error) {
    res.status(500).json({
      message: err,
    });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { phone_number } = req.body;
    const user = await UserModel.findOne({ phone_number });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const isOTPVerified = user.phone_number_verified;
    if (isOTPVerified !== true) {
      return res.status(401).json({
        message: "Mobile number is not verified.Try after mobile verification",
      });
    }
    // const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // if (!isPasswordCorrect)
    //   return res.status(400).json({ message: "Wrong Password!" });

    const token = jwt.sign({ phone: phone_number, id: user._id }, "secret", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, message: "Login successfull!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: err,
    });
  }
});

//================================================ USER PROFILE ================================================

//Me
router.get("/profile/me", Auth, async (req, res) => {
  try {
    let user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      message: err,
    });
  }
});

//Update profile
router.post("/profile/update", Auth, async (req, res) => {
  try {
    let user = req.user;
  } catch (error) {
    res.status(500).json({
      message: err,
    });
  }
});

//================================================ USER POST ====================================================

//Create post

//Get user posts

//Get all posts

module.exports = router;
