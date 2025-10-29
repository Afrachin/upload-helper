const { configDotenv } = require("dotenv")
const redis = require("redis")

const redisClient = redis.createClient({
  url: `redis://:${process.env["REDIS_PASSWORD"]}@${process.env["REDIS_HOST"]}:${process.env["REDIS_PORT"]}`
})

redisClient.connect()

module.exports = redisClient