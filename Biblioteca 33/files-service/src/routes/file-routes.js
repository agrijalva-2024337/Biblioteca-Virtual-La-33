import express from "express";
import { uploadSingle } from "../middlewares/upload.js";
import { validateJWT } from "../../../shared/middlewares/jwt.middleware.js";
import { validateInternalKey } from "../../../shared/middlewares/internal-auth.middleware.js";
import {
  validateUploadFile,
  validateUpdateStatus
} from "../middlewares/file-validator.js";
import {
  uploadFile,
  getFiles,
  getFileById,
  getMyFiles,
  searchFiles,
  updateFileStatus
} from "../controllers/file-controller.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Files
 */

/**
 * @openapi
 * /files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Subir archivo
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Archivo subido correctamente
 */
router.post(
  "/upload",
  validateJWT,
  uploadSingle("file"),
  validateUploadFile,
  uploadFile
);

/**
 * @openapi
 * /files:
 *   get:
 *     tags: [Files]
 *     summary: Obtener archivos (con filtros opcionales)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: ObjectId de la materia
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Busqueda por title (case-insensitive)
 */
router.get("/", validateJWT, getFiles);

router.get("/search", validateJWT, searchFiles);

/**
 * @openapi
 * /files/mine:
 *   get:
 *     tags: [Files]
 *     summary: Obtener los archivos del usuario autenticado
 */
router.get("/mine", validateJWT, getMyFiles);

/**
 * @openapi
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Obtener un archivo por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo encontrado
 *       404:
 *         description: Archivo no encontrado
 */
router.get("/:id", validateJWT, getFileById);

/**
 * @openapi
 * /files/{id}/status:
 *   patch:
 *     tags: [Files]
 *     summary: Actualizar el estado de un archivo (endpoint interno entre servicios)
 *     description: Protegido con API key interna (header x-internal-key). Lo llaman ai-service y moderation-service, no usuarios finales.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch(
  "/:id/status",
  validateInternalKey,
  validateUpdateStatus,
  updateFileStatus
);

export default router;