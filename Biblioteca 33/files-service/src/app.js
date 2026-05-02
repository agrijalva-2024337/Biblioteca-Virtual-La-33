require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./configs/swagger");

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/files", fileRoutes);
app.use("/comments", commentRoutes);
app.use("/subjects", subjectRoutes);

app.listen(3002, () => {
  console.log("Files Service running on port 3002");
});