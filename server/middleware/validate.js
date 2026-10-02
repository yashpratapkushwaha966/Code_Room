const ApiError = require('../utils/ApiError');

/**
 * Wraps a Zod schema into Express middleware. Validates req.body,
 * replaces it with the parsed (typed/trimmed) result, and forwards
 * a clean 400 error listing every issue if validation fails.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Validation failed', details));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
