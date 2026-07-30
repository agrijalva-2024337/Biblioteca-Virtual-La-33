import { body, param } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateUploadFile = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ max: 200 })
    .withMessage("El título no puede exceder 200 caracteres"),

  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 1000 })
    .withMessage("La descripción no puede exceder 1000 caracteres"),

  body("subject")
    .notEmpty()
    .withMessage("La materia es requerida")
    .isMongoId()
    .withMessage("La materia debe ser un ObjectId válido"),

  body("promotionYear")
    .notEmpty()
    .withMessage("El año académico (promotionYear) es requerido")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año académico debe ser un número entre 2000 y 2100")
    .toInt(),

  body("file").custom((_value, { req }) => {
    if (!req.file) {
      throw new Error("El archivo es requerido");
    }
    return true;
  }),

  checkValidators,
];

export const validateUpdateStatus = [
  param("id")
    .isMongoId()
    .withMessage("El ID del archivo debe ser un ObjectId válido"),

  body("status")
    .notEmpty()
    .withMessage("El status es requerido")
    .isIn(["pending", "approved", "rejected"])
    .withMessage("El status debe ser uno de: pending, approved, rejected"),

  body("reason")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La razón debe ser texto")
    .isLength({ max: 1000 })
    .withMessage("La razón no puede exceder 1000 caracteres"),

  checkValidators,
];
