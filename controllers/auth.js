const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

// * util fns
// - get token from model, create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
  // - create token (method is called on the actual user we get from the model User)
  const token = user.getSignedJwtToken();

  const options = {
    // > 30 days from now
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  // - setting cookies for JWT and sending JWT in response body
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token
    });
};

// @desc    register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // - create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 201, res);
});

// @desc    login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // - validate email & password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }

  // - check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    // > unautherized user
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // - matching passwords (method from the model User)
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // - set cookie "token" to "none"
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return next(new ErrorResponse(`No user with that email`, 404));
  }

  // - get reset token (method from the model User)
  const resetToken = user.getResetPasswordToken();

  await user.save({
    validateBeforeSave: false
  });

  // - create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // - send an email for reseting password
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message
    });

    res.status(200).json({
      success: true,
      data: "Email sent"
    });
  } catch (err) {
    console.log(err.red);

    // - get rid of fields [reserPasswordToken] and [resetPasswordExpire] in DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({
      validateBeforeSave: false
    });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// @desc    reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // - get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // - find user by reset token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  // - if expiration time is over or user with such token was not found
  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  // - set new password
  user.password = req.body.password;

  // - delete user fields responsible for token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // - send new token
  sendTokenResponse(user, 200, res);
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // - fields to update
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // - check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  // - change current password on a new one
  user.password = req.body.newPassword;

  // - update user password
  await user.save();

  // - send new token
  sendTokenResponse(user, 200, res);
});
