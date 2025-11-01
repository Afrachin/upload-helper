/**
 * Redis client configuration and initialization
 * @module redis
 */

const redis = require("redis")
const config = require("./config")
const logger = require("./utils/logger")

/**
 * Configured Redis client instance.
 * Automatically connects on module load with error handling and reconnection logic.
 * 
 * @type {import("redis").RedisClientType}
 */
const redisClient = redis.createClient({
  url: config.redis.url
})

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", { error: err.message })
})

redisClient.on("connect", () => {
  logger.info("Redis connected successfully")
})

redisClient.on("reconnecting", () => {
  logger.warn("Redis reconnecting...")
})

redisClient.connect().catch(err => {
  logger.error("Failed to connect to Redis", { error: err.message })
  process.exit(1)
})

module.exports = redisClient