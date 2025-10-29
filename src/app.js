const { configDotenv } = require("dotenv");
const express = require("express");
const indexRouter = require("./routes/index");

const PORT = process.env.PORT || 8080

configDotenv()

const app = express()

app.use(express.json())

app.use("/", indexRouter)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})