const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// - protect routes middleware (can use it in routes files)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // > get token from request headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    // > get token from cookies
    token = req.cookies.token;
  }

  // - make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  // - verify token by extracting payload from it
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // console.log(`dcd: `, decoded);

  // - find specific User by ID and include in req
  req.user = await User.findById(decoded.id);
  next();
});

// - grand access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role "${req.user.role}" is unauthorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
