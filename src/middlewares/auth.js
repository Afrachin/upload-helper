/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next 
 */
const authMiddleware = (req, res, next) => {
  const userAccessToken = req.headers["X-Access-Token"]

  if(!userAccessToken) {
    return res.status(403).send({
      success: false,
      message: "Auth Error",
      cause: "No access token detected on request"
    })
  }

  if(userAccessToken !== process.env["ACCESS_TOKEN"]) {
    return res.status(403).send({
      success: false,
      message: "Auth Error",
      cause: "Invalid access token"
    })
  }

  next()
}

module.exports = authMiddleware