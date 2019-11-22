const express = require("express");
const router = express.Router();

const {} = require("../controllers/users");

// - middleware for getting data
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

// - protect middleware
const { protect } = require("../middleware/auth");

module.exports = router;
