const { S3Client } = require("@aws-sdk/client-s3")

const s3 = new S3Client({
  region: process.env.OBJECT_STORAGE_REGION || "us-east-1",
  endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY
  }
})

module.exports = { s3 }