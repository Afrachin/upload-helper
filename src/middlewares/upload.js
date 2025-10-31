const multer = require("multer")

const maxUploadSizeMB = parseInt(process.env["MAX_UPLOAD_SIZE_MB"]) || 10
const maxUploadSizeBytes = maxUploadSizeMB * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxUploadSizeBytes
  }
})

module.exports = upload