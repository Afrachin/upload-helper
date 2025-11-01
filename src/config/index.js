/**
 * Centralized application configuration
 * @module config
 */

const { DEFAULT_PORT, DEFAULT_MAX_UPLOAD_SIZE_MB } = require("../constants")

/**
 * Application configuration object
 * @typedef {Object} Config
 * @property {number} port - Server port
 * @property {Object} auth - Authentication configuration
 * @property {string} auth.accessToken - API access token
 * @property {Object} redis - Redis configuration
 * @property {string} redis.url - Redis connection URL
 * @property {string} redis.keyPrefix - Prefix for Redis keys
 * @property {Object} s3 - S3 storage configuration
 * @property {string} s3.region - S3 region
 * @property {string} s3.endpoint - S3 endpoint URL
 * @property {string} s3.accessKeyId - S3 access key
 * @property {string} s3.secretAccessKey - S3 secret key
 * @property {string} s3.bucket - S3 bucket name
 * @property {Object} upload - Upload configuration
 * @property {number} upload.maxSizeMB - Maximum upload size in MB
 * @property {number} upload.maxSizeBytes - Maximum upload size in bytes (computed)
 * @property {number} upload.jsonLimitMB - Maximum JSON body size in MB
 * @property {Object} cors - CORS configuration
 * @property {string[]} cors.allowedOrigins - List of allowed origins
 * @property {Object} rateLimit - Rate limiting configuration
 * @property {number} rateLimit.windowMs - Time window in milliseconds
 * @property {number} rateLimit.maxRequests - Maximum requests per window
 */
const config = {
  port: parseInt(process.env.PORT) || DEFAULT_PORT,
  
  auth: {
    accessToken: process.env.ACCESS_TOKEN
  },
  
  redis: {
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    keyPrefix: process.env.REDIS_KEY_PREFIX
  },
  
  s3: {
    region: process.env.OBJECT_STORAGE_REGION || "us-east-1",
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
    accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY,
    bucket: process.env.OBJECT_STORAGE_BUCKET
  },
  
  upload: {
    maxSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB) || DEFAULT_MAX_UPLOAD_SIZE_MB,
    get maxSizeBytes() {
      return this.maxSizeMB * 1024 * 1024
    },
    jsonLimitMB: parseInt(process.env.JSON_BODY_LIMIT_MB) || 10
  },
  
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS 
      ? process.env.CORS_ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
      : []
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
}

module.exports = config

