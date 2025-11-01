/**
 * Request validation schemas
 * @module routes/index/validators
 */

const { default: z } = require("zod")

/**
 * Zod schema for filename validation.
 * Ensures filename is alphanumeric with underscores/hyphens and has an extension.
 * Prevents path traversal by disallowing slashes.
 * 
 * @type {import("zod").ZodString}
 * 
 * @example
 * Valid: "document.pdf", "photo_2024.jpg", "file-name.png"
 * Invalid: "../etc/passwd", "no-extension", "has/slash.txt"
 */
const filenameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/, { message: "Invalid filename format" })
  .refine((name) => !name.includes("/") && !name.includes("\\"), { message: "Filename must not contain paths" })

module.exports = { filenameSchema }