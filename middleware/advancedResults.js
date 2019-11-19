// * utils for filtering/selecting/sorting/paginating data:
// - filter data (ex: ?housing=true&location.city=Boston)
const filterData = (model, queryStr) => {
  // - replace comparison words from query with same word, but with '$' in front of them
  // ? ex: [https://docs.mongodb.com/manual/reference/operator/query/gt/]
  // > {"lte":"10000"} => {"$lte":"10000"}
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // - finding resource and populate it with courses it has
  return model.find(JSON.parse(queryStr));
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
const paginateData = (req, query, total, populate) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10; // per page
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

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  return {
    finishedQuery: query,
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
const buildQuery = (req, total, model, populate) => {
  let query;

  // - copy req.query
  const reqQuery = { ...req.query };

  // - create query string
  let queryStr = excludeReservedWords(reqQuery);

  // - filtering/selecting/sorting/paginating
  query = filterData(model, queryStr);
  query = selectData(req, query);
  query = sortData(req, query);
  const { pagination, finishedQuery } = paginateData(
    req,
    query,
    total,
    populate
  );

  return { buildedQuery: finishedQuery, pagination };
};

// * universal middleware for getting filtered data
const advancedResults = (model, populate) => async (req, res, next) => {
  const total = await model.countDocuments();
  const { buildedQuery, pagination } = buildQuery(req, total, model, populate);

  // - executing query
  const results = await buildedQuery;

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
