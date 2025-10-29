const { default: z } = require("zod")

const filenameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/, { message: "Invalid filename format" })
  .refine((name) => !name.includes("/") && !name.includes("\\"), { message: "Filename must not contain paths" })

module.exports = { filenameSchema }