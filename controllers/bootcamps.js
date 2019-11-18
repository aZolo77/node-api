const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");

// * util fns:
// - filter data (ex: ?housing=true&location.city=Boston)
const filterData = queryStr => {
  // - replace comparison words from query with same word, but with '$' in front of them
  // ? ex: [https://docs.mongodb.com/manual/reference/operator/query/gt/]
  // > {"lte":"10000"} => {"$lte":"10000"}
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // - finding resource and populate it with courses it has
  return Bootcamp.find(JSON.parse(queryStr)).populate("courses");
};

// - select fields (ex: ?select=name,description,housing)
const selectData = (req, query) => {
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    return query.select(fields);
  }
  return query;
};

// - sort fields (ex: ?sort=name | ?sort=-name)
const sortData = (req, query) => {
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    return query.sort(sortBy);
  } else {
    return query.sort("-createdAt");
  }
};

// - paginate over sources (ex: ?page=2&limit=2)
const paginateData = (req, query, total) => {
  const page = parseInt(req.query.page, 10) || 1;
  // console.log(`Limit: ${req.query.limit}`);
  const limit = parseInt(req.query.limit, 10) || 2; // per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // - pagination result for creating links on frontend
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  // console.log(
  //   `limit: ${limit}, startIndex: ${startIndex}, endIndex: ${endIndex}, total: ${total}, pagination: `,
  //   pagination
  // );

  return {
    finishedQuery: query.skip(startIndex).limit(limit),
    pagination
  };
};

// - exclude specific queries
const excludeReservedWords = reqQuery => {
  // - fields to exclude
  const removeFields = ["select", "sort", "limit", "page"];

  // - loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  return JSON.stringify(reqQuery);
};

// - building query
const buildQuery = (req, total) => {
  let query;

  // - copy req.query
  const reqQuery = { ...req.query };

  // - create query string
  let queryStr = excludeReservedWords(reqQuery);

  // - filtering/selecting/sorting/paginating
  query = filterData(queryStr);
  query = selectData(req, query);
  query = sortData(req, query);
  const { pagination, finishedQuery } = paginateData(req, query, total);

  return { buildedQuery: finishedQuery, pagination };
};

// @desc    get all bootcamps (with filtering/selecting/sorting)
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const total = await Bootcamp.countDocuments();
  const { buildedQuery, pagination } = buildQuery(req, total);

  // - executing query
  const bootcamps = await buildedQuery;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

// @desc    get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc    create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc    update single bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc    delete single bootcamp
// @route   Delete /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // - triggers the middleware of removing bootcamp with its associated courses
  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit?
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // - get lat/lng with geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // - calculating radius using radians (divide distance by radius of Earth)
  // ? ex: [https://docs.mongodb.com/manual/reference/operator/query/centerSphere/]
  // ? Earth Radius = 3,963 mi / 6,378 km (:unit)
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
