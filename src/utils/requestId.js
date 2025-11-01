/**
 * Request ID middleware module
 * @module utils/requestId
 */

const crypto = require("crypto")

/**
 * Middleware to add a unique request ID to each request.
 * Uses existing X-Request-Id header if present, otherwise generates a new UUID.
 * The request ID is added to the request object and returned in the response headers.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * app.use(requestIdMiddleware)
 * // Now req.id is available in all subsequent middleware/handlers
 */
function requestIdMiddleware(req, res, next) {
  req.id = req.headers["x-request-id"] || crypto.randomUUID()
  res.setHeader("X-Request-Id", req.id)
  next()
}

module.exports = requestIdMiddleware

