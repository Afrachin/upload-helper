/**
 * Route handlers for upload endpoints
 * @module routes/index/handlers
 */

const crypto = require("crypto")
const redisClient = require("../../redis")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { s3 } = require("../../s3")
const config = require("../../config")
const logger = require("../../utils/logger")
const { REDIS_UPLOAD_TTL, UPLOADS_PREFIX } = require("../../constants")
const { validateFileType } = require("../../utils/fileValidator")

/**
 * Creates a temporary upload ID for file upload.
 * Generates a UUID and stores the filename in Redis with TTL.
 * 
 * @async
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Request} req.body - Request body
 * @param {string} req.body.filename - Filename to associate with upload ID
 * @param {string} [req.id] - Request ID for logging
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * POST /upload
 * Body: { "filename": "photo.jpg" }
 * Response: { "success": true, "message": "Created Upload ID", "id": "uuid..." }
 */
async function createUpload(req, res) {
  try {
    const uploadId = crypto.randomUUID()
    const redisKey = config.redis.keyPrefix + uploadId

    await redisClient.set(
      redisKey,
      req.body.filename,
      {
        EX: REDIS_UPLOAD_TTL
      }
    )

    logger.info("Upload ID created", { uploadId, requestId: req.id })

    return res.json({
      success: true,
      message: "Created Upload ID",
      id: uploadId
    })
  } catch (err) {
    logger.error("Create Upload Error", { error: err.message, requestId: req.id })
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

/**
 * Handles file upload using a previously created upload ID.
 * Validates upload ID, file type, and content before uploading to S3.
 * 
 * @async
 * @param {import("express").Request} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.uploadId - Upload ID from /upload endpoint
 * @param {Express.Multer.File} [req.file] - Uploaded file from multer
 * @param {string} [req.id] - Request ID for logging
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * POST /user-upload/:uploadId
 * Form-data: file=@photo.jpg
 * Response: { "success": true, "message": "File uploaded successfully", "url": "https://..." }
 */
async function userUpload(req, res) {
  try {
    const { uploadId } = req.params

    // Validate uploadId format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(uploadId)) {
      return res.status(400).json({ success: false, message: "Invalid upload ID format" })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const redisKey = config.redis.keyPrefix + uploadId
    const savedFilename = await redisClient.get(redisKey)
    
    if (!savedFilename) {
      logger.warn("Upload attempt with invalid or expired ID", { uploadId, requestId: req.id })
      return res.status(400).json({ success: false, message: "Invalid or expired upload ID" })
    }

    const allowedExt = savedFilename.split(".").pop().toLowerCase()
    const actualExt = req.file.originalname.split(".").pop().toLowerCase()
    
    if (actualExt !== allowedExt) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid file type. Must be .${allowedExt}` 
      })
    }

    // Validate file content matches extension using magic bytes
    const validation = validateFileType(req.file.buffer, allowedExt)
    if (!validation.valid && process.env.STRICT_FILE) {
      logger.warn("File validation failed", { 
        uploadId, 
        reason: validation.reason,
        detectedMime: validation.detectedMime,
        expectedMime: validation.expectedMime,
        requestId: req.id 
      })
      return res.status(400).json({ 
        success: false, 
        message: `File validation failed: ${validation.reason}` 
      })
    }

    const finalKey = savedFilename

    const uploadParams = {
      Bucket: config.s3.bucket,
      Key: `${UPLOADS_PREFIX}/${finalKey}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read"
    }

    await s3.send(new PutObjectCommand(uploadParams))

    const cleanEndpoint = config.s3.endpoint.replace(/^https?:\/\//, "")
    const finalUrl = `https://${config.s3.bucket}.${cleanEndpoint}/${UPLOADS_PREFIX}/${finalKey}`

    // Fix: Delete with the correct Redis key (including prefix)
    await redisClient.del(redisKey)

    logger.info("File uploaded successfully", { 
      uploadId, 
      filename: finalKey, 
      requestId: req.id 
    })

    return res.json({ 
      success: true, 
      message: "File uploaded successfully", 
      url: finalUrl 
    })
  } catch (err) {
    logger.error("Upload Error", { error: err.message, uploadId: req.params.uploadId, requestId: req.id })
    return res.status(500).json({ success: false, message: "Internal server error during upload" })
  }
}

module.exports = { createUpload, userUpload }