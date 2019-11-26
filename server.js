// - dependencies
const express = require("express");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
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
const users = require("./routes/users");
const reviews = require("./routes/reviews");

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

// * security
// - sanitize data (for nosql injections)
app.use(mongoSanitize());
// - set various HTTP security headers
app.use(helmet());
// - prevent XSS atacks
app.use(xss());
// - rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // > 10 mins
  max: 100
});
app.use(limiter);
// - prevent http param polution
app.use(hpp());

// * enable CORS
app.use(cors());

// - set static folder (ex: /uploads/photo_5d725a1b7b292f5f8ceff788.jpg)
app.use(express.static(path.join(__dirname, "public")));

// * mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
