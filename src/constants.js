/**
 * Application constants
 * @module constants
 */

/**
 * Time-to-live for Redis upload keys (in seconds)
 * @constant {number}
 */
const REDIS_UPLOAD_TTL = 60 * 15 // 15 minutes

/**
 * Default maximum upload size in megabytes
 * @constant {number}
 */
const DEFAULT_MAX_UPLOAD_SIZE_MB = 10

/**
 * Default server port
 * @constant {number}
 */
const DEFAULT_PORT = 3000

/**
 * Prefix for uploaded files in S3 bucket
 * @constant {string}
 */
const UPLOADS_PREFIX = "uploads"

module.exports = {
  REDIS_UPLOAD_TTL,
  DEFAULT_MAX_UPLOAD_SIZE_MB,
  DEFAULT_PORT,
  UPLOADS_PREFIX
}

