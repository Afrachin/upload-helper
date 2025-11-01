/**
 * Authentication middleware module
 * @module middlewares/auth
 */

const config = require("../config")

/**
 * Authentication middleware that validates X-Access-Token header.
 * Compares the provided token against the configured ACCESS_TOKEN.
 * Returns 403 if token is missing or invalid.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * router.post('/protected', authMiddleware, handler)
 */
const authMiddleware = (req, res, next) => {
  const userAccessToken = req.headers["x-access-token"]

  if(!userAccessToken) {
    return res.status(403).json({
      success: false,
      message: "Auth Error",
      cause: "No access token detected on request"
    })
  }

  if(userAccessToken !== config.auth.accessToken) {
    return res.status(403).json({
      success: false,
      message: "Auth Error",
      cause: "Invalid access token"
    })
  }

  next()
}

module.exports = authMiddleware