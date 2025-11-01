/**
 * Security headers middleware module
 * @module middlewares/security
 */

/**
 * Security headers middleware (helmet-like functionality).
 * Sets various security-related HTTP headers to protect against common vulnerabilities.
 * 
 * Headers set:
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Enables XSS filter
 * - Strict-Transport-Security: Forces HTTPS
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts browser features
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * app.use(securityHeadersMiddleware)
 */
function securityHeadersMiddleware(req, res, next) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY")
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff")
  
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block")
  
  // Strict transport security (HTTPS only)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Permissions policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  
  next()
}

module.exports = securityHeadersMiddleware

