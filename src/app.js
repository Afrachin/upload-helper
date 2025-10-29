const { configDotenv } = require("dotenv");
configDotenv()

const express = require("express");
const indexRouter = require("./routes/index");

const PORT = parseInt(process.env.PORT) || 3000

const app = express()

app.use(express.json())

app.use("/", indexRouter)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})