import { body } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateGrade = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del grado es requerido")
    .isLength({ max: 80 })
    .withMessage("El nombre no puede exceder 80 caracteres"),

  body("order")
    .optional({ values: "falsy" })
    .isInt({ min: 0, max: 1000 })
    .withMessage("El orden debe ser un entero entre 0 y 1000")
    .toInt(),

  checkValidators,
];
