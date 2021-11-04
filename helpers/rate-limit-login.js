const rateLimit = require('express-rate-limit');
const { HttpCode } = require('../config/constants');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  handler: (_req, res, _next) => {
    return res.status(HttpCode.TOO_MANY_REQUESTS).json({
      status: 'error',
      code: HttpCode.TOO_MANY_REQUESTS,
      message: 'Too Many Requests',
    });
  },
});

module.exports = limiter;
