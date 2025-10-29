const { Router } = require("express")
const { default: z } = require("zod")
const authMiddleware = require("../../middlewares/auth")
const validateMiddleware = require("../../middlewares/validate")
const { filenameSchema } = require("./validators")
const { createUpload, userUpload } = require("./handlers")
const upload = require("../../middlewares/upload")

const indexRouter = Router()

indexRouter.post(
  "/upload",
  authMiddleware,
  validateMiddleware(z.object({ filename: filenameSchema }), "body"),
  createUpload
)

indexRouter.post(
  "/user-upload/:uploadId",
  upload.single("file"),
  userUpload
)

module.exports = indexRouter