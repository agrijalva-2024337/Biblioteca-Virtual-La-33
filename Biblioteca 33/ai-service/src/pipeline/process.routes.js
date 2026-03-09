import { Router } from "express";
import { processFromURL, processTestUpload } from "./process.controller.js";
import { uploadTestFile } from "../../middlewares/file-upload.js";

const router = Router();

router.post("/process-file", processFromURL);

router.post(
  "/test-upload",
  uploadTestFile.single("file"),
  processTestUpload
);

export default router;