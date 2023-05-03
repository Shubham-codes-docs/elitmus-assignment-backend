const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    return next(error);
  }
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      const error = new Error("User with given email already exists");
      error.statusCode = 200;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ msg: "User Registered successfully", success: 1 });
  } catch (err) {
    return next(new Error(err));
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    next(error);
  }
  const { email, password } = req.body;
  try {
    let user;
    let isAdmin = false;
    user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) {
        isAdmin = true;
      }
    }
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.name,
        },
        process.env.JWT_SECRET
      );

      let questionList = [],
        lastQuestion = [],
        increment;

      if (!isAdmin) {
        questionList = user.questions;
        lastQuestion =
          questionList.length > 0 &&
          questionList.reduce((prev, curr) => {
            return prev.questionId > curr.questionId ? prev : curr;
          });

        if (lastQuestion.status === true) {
          increment = 1;
        }
      }

      res.status(200).json({
        msg: "User logged in successfully",
        token,
        isAdmin,
        success: 1,
        lastQuestion:
          questionList.length > 0 ? lastQuestion.questionId + increment : 1,
      });
    } else {
      res.status(200).json({ msg: "Passwords do not match", success: 0 });
    }
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.adminSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new Error("Validation Failed,incorrect fields entered");
    error.statusCode = 422;
    return next(error);
  }
  try {
    const { name, email, password } = req.body;
    const existingUser = await Admin.findOne({
      email,
    });
    if (existingUser) {
      const error = new Error("User with given email already exists");
      error.statusCode = 200;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ msg: "User Registered successfully", success: 1 });
  } catch (err) {
    return next(new Error(err));
  }
};
