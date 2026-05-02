const express = require("express");

const router = express.Router();

const {
  addComment,
  getComments
} = require("../controllers/comment-controller");

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
router.post("/", addComment);

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
router.get("/:fileId", getComments);

module.exports = router;