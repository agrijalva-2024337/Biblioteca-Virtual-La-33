const express = require("express");

const router = express.Router();

const {
  createSubject,
  getSubjects
} = require("../controllers/subject-controller");

/**
 * @openapi
 * tags:
 *   - name: Subjects
 */

/**
 * @openapi
 * /subjects:
 *   post:
 *     tags: [Subjects]
 *     summary: Crear materia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Materia creada
 */
router.post("/", createSubject);

/**
 * @openapi
 * /subjects:
 *   get:
 *     tags: [Subjects]
 *     summary: Obtener materias
 */
router.get("/", getSubjects);

module.exports = router;