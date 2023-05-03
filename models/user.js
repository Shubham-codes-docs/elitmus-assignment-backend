const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const individualQuestionSchema = new Schema({
  questionId: {
    type: Number,
    required: true,
    default: 1,
  },
  hintsUsed: {
    type: Number,
    required: true,
    default: 0,
  },
  incorrectAnswers: {
    type: Number,
    reqired: true,
    default: 0,
  },
  timeTaken: {
    type: Number,
    required: true,
    default: 0,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: individualQuestionSchema,
        required: true,
      },
    ],
    totalPoints: {
      type: Number,
      required: false,
    },
    totalTime: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
