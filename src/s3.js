/**
 * S3 client configuration
 * @module s3
 */

const { S3Client } = require("@aws-sdk/client-s3")
const config = require("./config")

/**
 * Configured S3 client instance.
 * Works with any S3-compatible storage (AWS S3, MinIO, etc.).
 * 
 * @type {S3Client}
 */
const s3 = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  forcePathStyle: false,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  }
})

module.exports = { s3 }