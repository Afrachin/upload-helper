const { configDotenv } = require("dotenv");
configDotenv()

const express = require("express");
const indexRouter = require("./routes/index");

const PORT = process.env.PORT || 8080


const app = express()

app.use(express.json())

app.use("/", indexRouter)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})