const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  uploadFile,
  getFiles,
  searchFiles
} = require("../controllers/file-controller");

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
router.post("/upload", upload.single("file"), uploadFile);

/**
 * @openapi
 * /files:
 *   get:
 *     tags: [Files]
 *     summary: Obtener todos los archivos
 */
router.get("/", getFiles);

router.get("/search", searchFiles);

module.exports = router;