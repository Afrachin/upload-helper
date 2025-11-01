/**
 * Rate limiting middleware module
 * @module middlewares/rateLimit
 */

const config = require("../config")

/**
 * In-memory store for rate limit tracking
 * @typedef {Object} RateLimitRecord
 * @property {number} count - Number of requests in current window
 * @property {number} resetTime - Timestamp when the window resets
 */

/**
 * Simple in-memory rate limiter store
 * Maps identifiers (token or IP) to rate limit records
 * @type {Map<string, RateLimitRecord>}
 */
const rateLimitStore = new Map()

/**
 * Rate limiting middleware that tracks requests per identifier.
 * Uses X-Access-Token header or IP address as identifier.
 * Returns 429 Too Many Requests if limit exceeded.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * router.post('/api', rateLimitMiddleware, handler)
 */
function rateLimitMiddleware(req, res, next) {
  const identifier = req.headers["x-access-token"] || req.ip
  const now = Date.now()
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + config.rateLimit.windowMs })
    return next()
  }
  
  const record = rateLimitStore.get(identifier)
  
  if (now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + config.rateLimit.windowMs })
    return next()
  }
  
  if (record.count >= config.rateLimit.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    res.setHeader("Retry-After", retryAfter)
    return res.status(429).json({
      success: false,
      message: "Too many requests",
      retryAfter
    })
  }
  
  record.count++
  next()
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000)

module.exports = rateLimitMiddleware

