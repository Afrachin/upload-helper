/**
 * Main routes configuration
 * @module routes/index
 */

const { Router } = require("express")
const { default: z } = require("zod")
const cors = require("cors")
const config = require("../../config")
const authMiddleware = require("../../middlewares/auth")
const validateMiddleware = require("../../middlewares/validate")
const rateLimitMiddleware = require("../../middlewares/rateLimit")
const { filenameSchema } = require("./validators")
const { createUpload, userUpload } = require("./handlers")
const upload = require("../../middlewares/upload")

/**
 * Main router instance
 * @type {import("express").Router}
 */
const indexRouter = Router()

/**
 * CORS configuration with origin validation
 * @type {import("cors").CorsOptions}
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    
    // If no specific origins configured, allow all
    if (config.cors.allowedOrigins.length === 0) {
      return callback(null, true)
    }
    
    // Check if origin is in allowed list
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}

indexRouter.post(
  "/upload",
  rateLimitMiddleware,
  authMiddleware,
  validateMiddleware(z.object({ filename: filenameSchema }), "body"),
  createUpload
)

indexRouter.post(
  "/user-upload/:uploadId",
  cors(corsOptions),
  rateLimitMiddleware,
  upload.single("file"),
  userUpload
)

module.exports = indexRouter