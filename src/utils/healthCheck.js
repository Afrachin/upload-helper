/**
 * Health check utilities
 * @module utils/healthCheck
 */

const redisClient = require("../redis")
const { s3 } = require("../s3")
const { ListBucketsCommand } = require("@aws-sdk/client-s3")
const config = require("../config")

/**
 * Custom health check function that tests critical dependencies.
 * Checks Redis and S3 connectivity and returns appropriate status.
 * 
 * @async
 * @returns {Promise<{status: number, response: Object}>} Health check result
 * @property {number} status - HTTP status code (200 healthy, 503 unhealthy)
 * @property {Object} response - Detailed health check results
 * @property {boolean} response.redis - Redis connectivity status
 * @property {boolean} response.s3 - S3 connectivity status
 * @property {string} response.timestamp - ISO timestamp of health check
 * @property {Object} response.config - Non-sensitive configuration info
 * 
 * @example
 * const result = await customHealthCheck()
 * // { status: 200, response: { redis: true, s3: true, ... } }
 */
async function customHealthCheck() {
  const checks = {
    redis: false,
    s3: false,
    timestamp: new Date().toISOString()
  }
  
  let overallStatus = 200

  // Check Redis connectivity
  try {
    await redisClient.ping()
    checks.redis = true
  } catch (err) {
    checks.redis = false
    checks.redisError = err.message
    overallStatus = 503
  }

  // Check S3 connectivity
  try {
    await s3.send(new ListBucketsCommand({}))
    checks.s3 = true
  } catch (err) {
    checks.s3 = false
    checks.s3Error = err.message
    overallStatus = 503
  }

  // Add config info (non-sensitive)
  checks.config = {
    port: config.port,
    maxUploadSizeMB: config.upload.maxSizeMB,
    jsonLimitMB: config.upload.jsonLimitMB,
    corsConfigured: config.cors.allowedOrigins.length > 0
  }

  return {
    status: overallStatus,
    response: checks
  }
}

module.exports = { customHealthCheck }

