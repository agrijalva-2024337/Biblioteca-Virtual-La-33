import { body } from "express-validator";
import { checkValidators } from "./check-validators.js";

export const validateCreateComment = [
  body("fileId")
    .notEmpty()
    .withMessage("El ID del archivo es requerido")
    .isMongoId()
    .withMessage("El fileId debe ser un ObjectId válido"),

  body("text")
    .trim()
    .notEmpty()
    .withMessage("El comentario es requerido")
    .isLength({ max: 500 })
    .withMessage("El comentario no puede exceder 500 caracteres"),

  checkValidators,
];
