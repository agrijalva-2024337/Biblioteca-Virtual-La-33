import express from "express";
import {
  validateJWT,
  requireRole,
} from "../../../shared/middlewares/jwt.middleware.js";
import { validateCreateGrade } from "../middlewares/grade-validator.js";
import { createGrade, listGrades } from "../controllers/grade-controller.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Grades
 */

/**
 * @openapi
 * /grades:
 *   get:
 *     tags: [Grades]
 *     summary: Listar grados (ordenados)
 */
router.get("/", validateJWT, listGrades);

/**
 * @openapi
 * /grades:
 *   post:
 *     tags: [Grades]
 *     summary: Crear grado (ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 6to grado
 *               order:
 *                 type: number
 *                 example: 6
 */
router.post(
  "/",
  validateJWT,
  requireRole("ADMIN_ROLE"),
  validateCreateGrade,
  createGrade
);

export default router;
