require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./configs/db");

const fileRoutes = require("./routes/file-routes");
const commentRoutes = require("./routes/comment-routes");
const subjectRoutes = require("./routes/subject-routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/files", fileRoutes);
app.use("/comments", commentRoutes);
app.use("/subjects", subjectRoutes);

app.listen(3002, () => {
  console.log("Files Service running on port 3002");
});