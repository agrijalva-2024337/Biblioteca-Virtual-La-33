import { Router } from "express";
import { processFromURL, processTestUpload } from "./process.controller.js";
import { uploadTestFile } from "../../middlewares/file-upload.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Procesamiento de archivos con IA
 */

/**
 * @swagger
 * /pipeline/process-file:
 *   post:
 *     summary: Procesa un archivo desde URL
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: string
 *               uploadedBy:
 *                 type: string
 *               fileURL:
 *                 type: string
 *     responses:
 *       200:
 *         description: Archivo procesado correctamente
 */
router.post("/process-file", processFromURL);

/**
 * @swagger
 * /pipeline/test-upload:
 *   post:
 *     summary: Subida de archivo de prueba
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Archivo procesado correctamente
 */
router.post(
  "/test-upload",
  uploadTestFile.single("file"),
  processTestUpload
);

export default router;