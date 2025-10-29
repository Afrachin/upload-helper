const crypto = require("crypto")
const redisClient = require("../../redis")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { s3 } = require("./s3")

async function createUpload(req, res) {
  try {
    const uploadId = crypto.randomUUID()

    await redisClient.set(
      uploadId,
      req.body.filename,
      {
        expiration: {
          type: "EX",
          value: 60 * 15
        }
      }
    )

    return res.send({
      success: true,
      message: "Created Upload ID",
      id: uploadId
    })
  } catch (err) {
    console.error("Create Upload Error:", err)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

async function userUpload(req, res) {
  try {
    const { uploadId } = req.params

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const savedFilename = await redisClient.get(uploadId)
    if (!savedFilename) {
      return res.status(400).json({ success: false, message: "Invalid or expired upload ID" })
    }

    const allowedExt = savedFilename.split(".").pop().toLowerCase()
    const actualExt = req.file.originalname.split(".").pop().toLowerCase()
    if (actualExt !== allowedExt) {
      return res.status(400).json({ success: false, message: `Invalid file type. Must be .${allowedExt}` })
    }

    const finalKey = `${crypto.randomUUID()}.${allowedExt}`

    const uploadParams = {
      Bucket: process.env.OBJECT_STORAGE_BUCKET,
      Key: `uploads/${finalKey}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read"
    }

    await s3.send(new PutObjectCommand(uploadParams))

    const bucket = process.env.OBJECT_STORAGE_BUCKET
    const baseEndpoint = process.env.OBJECT_STORAGE_ENDPOINT || ""
    const cleanEndpoint = baseEndpoint.replace(/^https?:\/\//, "")
    const finalUrl = `https://${bucket}.${cleanEndpoint}/uploads/${finalKey}`

    await redisClient.del(uploadId)

    return res.json({ success: true, message: "File uploaded successfully", url: finalUrl })
  } catch (err) {
    console.error("Upload Error:", err)
    return res.status(500).json({ success: false, message: "Internal server error during upload" })
  }
}

module.exports = { createUpload, userUpload }