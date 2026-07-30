import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./configs/swagger.js";
import connectDB from "./configs/db.js";
import { corsOptions } from "./configs/cors.configuration.js";
import { errorHandler } from "../../shared/utils/responseFormatter.js";

import fileRoutes from "./routes/file-routes.js";
import commentRoutes from "./routes/comment-routes.js";
import subjectRoutes from "./routes/subject-routes.js";
import gradeRoutes from "./routes/grade-routes.js";

const app = express();

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Archivos locales cuando Cloudinary no está configurado (modo desarrollo)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/files", fileRoutes);
app.use("/comments", commentRoutes);
app.use("/subjects", subjectRoutes);
app.use("/grades", gradeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Files Service running on port ${PORT}`);
  if (
    !process.env.CLOUDINARY_NAME?.trim() ||
    !process.env.CLOUDINARY_KEY?.trim() ||
    !process.env.CLOUDINARY_SECRET?.trim()
  ) {
    console.warn(
      "CLOUDINARY_* no configurado — uploads usan disco local (./uploads). Para producción define CLOUDINARY_NAME/KEY/SECRET."
    );
  }
});
