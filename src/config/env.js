/**
 * Environment variable validation module
 * @module config/env
 */

const { configDotenv } = require("dotenv")
configDotenv({
  quiet: true
})

/**
 * List of required environment variables
 * @constant {string[]}
 */
const requiredEnvVars = [
  "ACCESS_TOKEN",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_KEY_PREFIX",
  "OBJECT_STORAGE_ENDPOINT",
  "OBJECT_STORAGE_ACCESS_KEY",
  "OBJECT_STORAGE_SECRET_KEY",
  "OBJECT_STORAGE_BUCKET"
]

/**
 * Validates that all required environment variables are set
 * Exits the process with code 1 if any required variables are missing
 * @throws {Error} Exits process if validation fails
 * @returns {void}
 */
function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:")
    missing.forEach(varName => console.error(`   - ${varName}`))
    console.error("\nPlease check your .env file and ensure all required variables are set.")
    process.exit(1)
  }
  
  console.log("✓ All required environment variables are set")
}

module.exports = { validateEnv }

