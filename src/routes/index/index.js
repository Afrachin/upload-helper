const { Router } = require("express")
const authMiddleware = require("../../middlewares/auth")
const validateMiddleware = require("../../middlewares/validate")
const { default: z } = require("zod")
const redisClient = require("../../redis")
const multer = require("multer")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

const s3 = new S3Client({
  region: process.env.OBJECT_STORAGE_REGION || "us-east-1",
  endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY,
  },
})
const upload = multer({ storage: multer.memoryStorage() })

const indexRouter = Router()

const filenameSchema = z
  .string()
  // must include a file extension, like "test.png"
  .regex(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/, {
    message: "Invalid filename format"
  })
  // prevent path traversal attempts
  .refine((name) => !name.includes("/") && !name.includes("\\"), {
    message: "Filename must not contain paths"
})

indexRouter.post(
  "/upload",
  authMiddleware,
  validateMiddleware(
    z.object({
      filename: filenameSchema
    }),
    "body"
  ),
  async (req, res) => {
    const uploadId = crypto.randomUUID()

    await redisClient.set(
      uploadId,
      req.body.filename,
      {
        expiration: {
          type: "EX",
          value: 120
        }
      }
    )

    return res.send({
      success: true,
      message: "Created Upload ID",
      id: uploadId
    })
  })

indexRouter.post(
  "/user-upload/:uploadId",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { uploadId } = req.params

      // ✅ Validate file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        })
      }

      // ✅ Check Redis for valid Upload ID
      const savedFilename = await redisClient.get(uploadId)
      if (!savedFilename) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired upload ID",
        })
      }

      // ✅ Extract extension from Redis filename
      const allowedExt = savedFilename.split(".").pop().toLowerCase()

      // ✅ Validate uploaded file extension
      const actualExt = req.file.originalname.split(".").pop().toLowerCase()
      if (actualExt !== allowedExt) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Must be .${allowedExt}`,
        })
      }

      // ✅ Generate final file key (use original name from Redis)
      const finalKey = `${crypto.randomUUID()}.${allowedExt}`

      // ✅ Upload to S3
      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `uploads/${finalKey}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }

      await s3.send(new PutObjectCommand(uploadParams))

      const bucket = process.env.OBJECT_STORAGE_BUCKET;
      const baseEndpoint = process.env.OBJECT_STORAGE_ENDPOINT;

      // Remove protocol to avoid double scheme issues when formatting
      const cleanEndpoint = baseEndpoint.replace(/^https?:\/\//, "");

      // Virtual-host style:
      const finalUrl = `https://${bucket}.${cleanEndpoint}/uploads/${finalKey}`;

      // ✅ Remove the entry so it cannot be reused
      await redisClient.del(uploadId)

      return res.json({
        success: true,
        message: "File uploaded successfully",
        url: finalUrl,
      })

    } catch (err) {
      console.error("Upload Error:", err)
      return res.status(500).json({
        success: false,
        message: "Internal server error during upload",
      })
    }
  }
)

module.exports = indexRouter