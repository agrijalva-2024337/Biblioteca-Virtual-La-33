import express from "express";
import {
  validateJWT,
  requireRole
} from "../../../shared/middlewares/jwt.middleware.js";
import {
  validateCreateSubject,
  validateGetSubjects,
  validateAssignTeachers,
  validateUpdateSubject,
} from "../middlewares/subject-validator.js";
import {
  createSubject,
  getSubjects,
  assignTeachers,
  updateSubject,
} from "../controllers/subject-controller.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Subjects
 */

router.post(
  "/",
  validateJWT,
  requireRole("ADMIN_ROLE", "TEACHER_ROLE"),
  validateCreateSubject,
  createSubject
);

/**
 * @openapi
 * /subjects:
 *   get:
 *     tags: [Subjects]
 *     summary: Obtener materias (opcional ?grade= y/o ?teacherId=)
 */
router.get("/", validateJWT, validateGetSubjects, getSubjects);

/**
 * @openapi
 * /subjects/{id}:
 *   put:
 *     tags: [Subjects]
 *     summary: Editar nombre y/o grado de una asignatura (ADMIN)
 */
router.put(
  "/:id",
  validateJWT,
  requireRole("ADMIN_ROLE"),
  validateUpdateSubject,
  updateSubject
);

/**
 * @openapi
 * /subjects/{id}/teachers:
 *   patch:
 *     tags: [Subjects]
 *     summary: Reemplazar profesores asignados a una materia (ADMIN)
 */
router.patch(
  "/:id/teachers",
  validateJWT,
  requireRole("ADMIN_ROLE"),
  validateAssignTeachers,
  assignTeachers
);

export default router;
