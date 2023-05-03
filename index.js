const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const auth = require("./routes/auth");
const user = require("./routes/users");

dotenv.config();
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use("/auth", auth);
app.use("/user", user);

//error handling
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 502;
  res.status(statusCode).json({ msg: error.message, success: 0 });
  next();
});

//server and db connections
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
