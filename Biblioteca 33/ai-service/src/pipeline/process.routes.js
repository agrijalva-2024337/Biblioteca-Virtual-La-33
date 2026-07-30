import { Router } from "express";
import { processFromURL, processTestUpload } from "./process.controller.js";
import { uploadTestFile } from "../../middlewares/file-upload.js";
import { validateInternalKey } from "../../../shared/middlewares/internal-auth.middleware.js";

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
router.post("/process-file", validateInternalKey, processFromURL);

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
// Endpoint de prueba/desarrollo: solo se registra fuera de produccion.
// En produccion no existe la ruta, por lo que cualquier request cae en el
// manejador de "ruta no encontrada" (404), sin revelar que existia.
if (process.env.NODE_ENV !== "production") {
  router.post(
    "/test-upload",
    uploadTestFile.single("file"),
    processTestUpload
  );
}

export default router;