// - dependencies
const express = require("express");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const colors = require("colors");

// * middleware
// - logger
const morgan = require("morgan");
// - error handler
const errorHandler = require("./middleware/error");

// - DB connection
const connectDB = require("./config/db");

// - load env vars
dotenv.config({
  path: "./config/config.env"
});

// - connect to DB
connectDB();

// - routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

// - app init
const app = express();

// - body parser (parses req.body)
app.use(express.json());

// - cockie parser (parses req.cookies)
app.use(cookieParser());

// * dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// * file uploading middleware
app.use(fileupload());

// - set static folder (ex: /uploads/photo_5d725a1b7b292f5f8ceff788.jpg)
app.use(express.static(path.join(__dirname, "public")));

// * mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

// - handling errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// - handle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.underline.italic);

  // > close Server and exit proccess
  server.close(() => process.exit(1));
});
