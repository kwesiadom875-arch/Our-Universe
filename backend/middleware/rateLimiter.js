const rateLimit = require('express-rate-limit');

// Limiter for authentication routes (login, register)
// Allow 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        msg: "Too many login attempts from this IP, please try again after 15 minutes"
    }
});

// Limiter for general API routes
// Allow 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        msg: "Too many requests from this IP, please try again later"
    }
});

module.exports = {
    authLimiter,
    apiLimiter
};
