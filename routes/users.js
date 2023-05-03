const express = require("express");
const user = require("../controllers/user");
const IS_AUTH = require("../middlewares/auth");

const router = express.Router();

router.post("/submit-answer", IS_AUTH, user.updateAnswer);
router.post("/update-hints", IS_AUTH, user.updateHintCounts);
router.post("/update-incorrect-ans", IS_AUTH, user.updateIncorrectAns);
router.post("/get-question-details", IS_AUTH, user.getQuestionDetails);
router.get("/generate-report", IS_AUTH, user.getUserReport);
router.get("/generate-leaderboard", IS_AUTH, user.getLeaderBoard);
router.get("/get-individual-details/:id", IS_AUTH, user.individualDetails);
router.get("/reset-game", IS_AUTH, user.resetGame);

module.exports = router;
