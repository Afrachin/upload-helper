/**
 * Main application entry point
 * Configures Express server with security middleware, routes, and graceful shutdown
 * @module app
 */

// Load and validate environment variables
const { validateEnv } = require("./config/env")
validateEnv()

const express = require("express")
const config = require("./config")
const logger = require("./utils/logger")
const requestIdMiddleware = require("./utils/requestId")
const securityHeadersMiddleware = require("./middlewares/security")
const indexRouter = require("./routes/index")
const redisClient = require("./redis")

const app = express()

// Middleware
app.use(securityHeadersMiddleware)
app.use(requestIdMiddleware)
app.use(express.json({ limit: "10mb" }))

// Routes
app.use("/", indexRouter)

// Start server
const server = app.listen(config.port, () => {
  logger.info(`App listening on port ${config.port}`)
})

/**
 * Handles graceful shutdown of the application.
 * Closes HTTP server and Redis connections before exiting.
 * Forces shutdown after 10 seconds if cleanup doesn't complete.
 * 
 * @async
 * @param {string} signal - Signal name that triggered shutdown (SIGTERM, SIGINT)
 * @returns {void}
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
  server.close(async () => {
    logger.info("HTTP server closed")
    
    try {
      await redisClient.quit()
      logger.info("Redis connection closed")
      process.exit(0)
    } catch (err) {
      logger.error("Error during graceful shutdown", { error: err.message })
      process.exit(1)
    }
  })
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout")
    process.exit(1)
  }, 10000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))