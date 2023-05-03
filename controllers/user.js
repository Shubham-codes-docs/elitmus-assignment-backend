const User = require("../models/user");

exports.updateAnswer = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { questionDetails } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const questions = user.questions.filter((q) => {
      return q.questionId != questionDetails.questionId;
    });
    const updatedQuestions = [...questions, questionDetails];
    user.questions = updatedQuestions;
    const totalTime = updatedQuestions.reduce((accumulator, curr) => {
      return accumulator + curr.timeTaken;
    }, 0);

    const totalPoints = updatedQuestions.reduce((accumulator, curr) => {
      return accumulator + curr.points;
    }, 0);
    user.totalTime = totalTime.toFixed(2);
    user.totalPoints = totalPoints.toFixed(2);

    await user.save();
    res
      .status(200)
      .json({ msg: "Question details updated successfully", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.updateHintCounts = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { questionId, timeTaken } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const question = user.questions.filter((q) => {
      return q.questionId == questionId;
    });
    if (question.length === 0) {
      const questionDetails = {
        questionId,
        hintsUsed: 1,
        incorrectAnswers: 0,
        timeTaken,
        points: 0,
        status: false,
      };
      const updatedQuestions = [...user.questions, questionDetails];
      user.questions = updatedQuestions;
      await user.save();
    } else {
      await User.updateOne(
        { _id: req.userId, "questions.questionId": questionId },
        { $inc: { "questions.$.hintsUsed": 1 } }
      );
    }
    res.status(200).json({ msg: "Hints updated successfully", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.updateIncorrectAns = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { questionId, timeTaken } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const question = user.questions.filter((q) => {
      return q.questionId == questionId;
    });
    if (question.length === 0) {
      const questionDetails = {
        questionId,
        hintsUsed: 0,
        incorrectAnswers: 1,
        timeTaken,
        points: 0,
        status: false,
      };
      const updatedQuestions = [...user.questions, questionDetails];
      user.questions = updatedQuestions;
      await user.save();
    } else {
      await User.updateOne(
        { _id: req.userId, "questions.questionId": questionId },
        { $inc: { "questions.$.incorrectAnswers": 1 } }
      );
    }

    res
      .status(200)
      .json({ msg: "Incorrect answers updated successfully", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.getQuestionDetails = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { questionId } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const questionDetails = user.questions.filter((q) => {
      return q.questionId == questionId;
    });

    if (questionDetails.length === 0) {
      return res.status(200).json({ msg: "No question found", success: 0 });
    }
    res.status(200).json({
      success: 1,
      hints: questionDetails[0].hintsUsed,
      incorrectAns: questionDetails[0].incorrectAnswers,
      questionStatus: questionDetails[0].status,
    });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.getUserReport = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  try {
    const user = await User.findOne({ _id: req.userId });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const fastestTime =
      user.questions.length > 0
        ? user.questions.reduce((prev, curr) => {
            return prev.timeTaken < curr.timeTaken ? prev : curr;
          })
        : 0;

    const slowestTime =
      user.questions.length > 0
        ? user.questions.reduce((prev, curr) => {
            return prev.timeTaken > curr.timeTaken ? prev : curr;
          })
        : 0;

    const userReport = {
      name: user.name,
      totalPoints: user.totalPoints,
      totalTime: user.totalTime,
      fastestTime: fastestTime.timeTaken,
      slowestTime: slowestTime.timeTaken,
    };

    res.status(200).json({
      msg: "User report fetched successfully.",
      userReport,
      success: 1,
    });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.getLeaderBoard = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  try {
    const users = await User.find().sort({ totalPoints: -1 });

    if (!users) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const userReports = users.map((user) => {
      return {
        id: user._id,
        totalPoints: user.totalPoints,
        totalTime: user.totalTime,
        name: user.name,
      };
    });

    res.status(200).json({
      msg: "User report fetched successfully.",
      userReports,
      success: 1,
    });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.individualDetails = async (req, res, next) => {
  if (!req.isAuth || !req.isAdmin) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }

  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    const userReport = {
      totalPoints: user.totalPoints,
      totalTime: user.totalTime,
      name: user.name,
      questions: user.questions,
    };

    res.status(200).json({
      msg: "User report fetched successfully.",
      userReport,
      success: 1,
    });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};

exports.resetGame = async (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Unauthorized access");
    error.statusCode = 200;
    return next(error);
  }
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 200;
      return next(error);
    }

    user.questions = [];
    user.totalPoints = 0;
    user.totalTime = 0;
    await user.save();
    res.status(200).json({ msg: "Game reset successfully", success: 1 });
  } catch (error) {
    const err = new Error(error);
    err.statusCode = 500;
    return next(err);
  }
};
