/**
 * Zod validation middleware factory
 * @module middlewares/validate
 */

const { ZodSchema } = require("zod")

/**
 * Creates a validation middleware using a Zod schema.
 * Validates a specific section of the request (body, query, params, or headers).
 * Returns 400 with Zod error details if validation fails.
 * 
 * @param {ZodSchema} zodObject - Zod schema to validate against
 * @param {"body" | "query" | "params" | "headers"} section - Request section to validate
 * @returns {Function} Express middleware function
 * 
 * @example
 * const schema = z.object({ email: z.string().email() })
 * router.post('/user', validateMiddleware(schema, 'body'), handler)
 */
function validateMiddleware(zodObject, section) {
  /**
   * Middleware function that performs the validation
   * @param {import("express").Request} req - Express request object
   * @param {import("express").Response} res - Express response object
   * @param {import("express").NextFunction} next - Express next middleware function
   * @returns {void}
   */
  const middleware = (req, res, next) => {
    const parseResult = zodObject.safeParse(req[section])

    if(!parseResult.success) {
      return res.status(400).send({
        success: false,
        message: "Zod Error",
        cause: parseResult.error
      })
    }

    next()
  }

  return middleware
}

module.exports = validateMiddleware