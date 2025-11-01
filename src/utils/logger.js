/**
 * Simple logging utility
 * @module utils/logger
 */

/**
 * Gets current timestamp in ISO format
 * @private
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString()
}

/**
 * Internal log function that formats and outputs log entries
 * @private
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {string} message - Log message
 * @param {Object} [meta={}] - Additional metadata to log
 * @returns {void}
 */
function log(level, message, meta = {}) {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  }
  
  const formattedMeta = Object.keys(meta).length > 0 
    ? ` ${JSON.stringify(meta)}`
    : ""
  
  console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${formattedMeta}`)
}

/**
 * Logger instance with level-specific methods
 * @namespace logger
 */
const logger = {
  /**
   * Log an info message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {void}
   */
  info: (message, meta) => log("info", message, meta),
  
  /**
   * Log an error message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {void}
   */
  error: (message, meta) => log("error", message, meta),
  
  /**
   * Log a warning message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {void}
   */
  warn: (message, meta) => log("warn", message, meta),
  
  /**
   * Log a debug message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {void}
   */
  debug: (message, meta) => log("debug", message, meta)
}

module.exports = logger

