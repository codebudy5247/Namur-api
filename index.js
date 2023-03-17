const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");
const connectDB = require("./DB");

//Logger
app.use(logger("dev"));

//BodyParser
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

//CORS
app.use(cors());

//.env
dotenv.config();

//Routes
app.use("/api", require("./routes")); //APIs

//Connect to DB.
connectDB();

//static files {Server side rendering}
// app.use(express.static(path.join(__dirname, "./krishiiyan/build")));

// app.get("*", function (req, res) {
//   res.sendFile(path.join(__dirname, "./krishiiyan/build/index.html"));
// });

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`server running at port:${port}`);
});
