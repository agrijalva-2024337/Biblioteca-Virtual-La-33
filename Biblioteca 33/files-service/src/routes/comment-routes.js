import express from "express";
import { validateJWT } from "../../../shared/middlewares/jwt.middleware.js";
import { validateCreateComment } from "../middlewares/comment-validator.js";
import {
  addComment,
  getComments
} from "../controllers/comment-controller.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Comments
 */

/**
 * @openapi
 * /comments:
 *   post:
 *     tags: [Comments]
 *     summary: Crear comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comentario creado
 */
router.post("/", validateJWT, validateCreateComment, addComment);

/**
 * @openapi
 * /comments/{fileId}:
 *   get:
 *     tags: [Comments]
 *     summary: Obtener comentarios por archivo
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get("/:fileId", validateJWT, getComments);

export default router;