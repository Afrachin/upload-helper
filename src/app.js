const { configDotenv } = require("dotenv");
const express = require("express")

const PORT = process.env.PORT || 8080

configDotenv()

const app = express()

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})