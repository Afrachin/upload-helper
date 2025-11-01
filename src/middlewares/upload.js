/**
 * Multer upload middleware configuration
 * @module middlewares/upload
 */

const multer = require("multer")
const config = require("../config")

/**
 * Configured multer instance for file uploads.
 * Uses memory storage and enforces file size limits from config.
 * 
 * @type {multer.Multer}
 * 
 * @example
 * router.post('/upload', upload.single('file'), handler)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxSizeBytes
  }
})

module.exports = upload