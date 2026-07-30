import { body, param, query } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateSubject = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la materia es requerido")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),

  body("grade")
    .trim()
    .notEmpty()
    .withMessage("El grado es requerido"),

  checkValidators,
];

export const validateGetSubjects = [
  query("grade")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("grade no puede estar vacío"),

  query("teacherId")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("teacherId no puede estar vacío"),

  checkValidators,
];

export const validateAssignTeachers = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("El id de la asignatura es requerido")
    .isMongoId()
    .withMessage("El id de la asignatura no es válido"),

  body("teacherIds")
    .isArray()
    .withMessage("teacherIds debe ser un arreglo"),

  body("teacherIds.*")
    .optional()
    .isString()
    .withMessage("Cada teacherId debe ser un string")
    .trim()
    .notEmpty()
    .withMessage("Los teacherIds no pueden estar vacíos"),

  checkValidators,
];

export const validateUpdateSubject = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("El id de la asignatura es requerido")
    .isMongoId()
    .withMessage("El id de la asignatura no es válido"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres"),

  body("grade")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El grado no puede estar vacío"),

  checkValidators,
];
