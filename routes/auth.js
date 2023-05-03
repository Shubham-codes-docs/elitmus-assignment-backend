const express = require("express");
const { body } = require("express-validator");
const auth = require("../controllers/auth");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty(),
  ],
  auth.login
);
router.post(
  "/signup",
  [
    body("name").trim().notEmpty(),
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty(),
  ],
  auth.signup
);

router.post(
  "/admin-signup",
  [
    body("name").trim().notEmpty(),
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty(),
  ],
  auth.adminSignUp
);

module.exports = router;
