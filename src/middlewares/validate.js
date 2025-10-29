const { ZodSchema } = require("zod/v3");

/**
 * 
 * @param {ZodSchema} zodObject 
 * @param {"body" | "query" | "params" | "headers"} section
 * @returns 
 */
function validateMiddleware(zodObject, section) {
  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   * @param {import("express").NextFunction} next 
   * @returns 
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