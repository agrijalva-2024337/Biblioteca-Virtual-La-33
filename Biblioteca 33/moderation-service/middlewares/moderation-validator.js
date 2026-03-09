import { body, param, query } from 'express-validator'
import { validateJWT } from './validate-JWT.js'
import { requireRole } from './validate-role.js';
import { checkValidators } from './check-validators.js'


// Crear moderación (lo llama el servicio de IA)


export const validateCreateModeration = [
  body('fileId')
    .trim()
    .notEmpty()
    .withMessage('El ID del archivo es requerido')
    .isLength({ max: 100 })
    .withMessage('El ID no puede exceder 100 caracteres'),

  body('uploadedBy')
    .notEmpty()
    .withMessage('El usuario que sube el archivo es requerido'),

  body('fileURL')
    .notEmpty()
    .withMessage('La URL del archivo es requerida')
    .isURL()
    .withMessage('Debe ser una URL válida'),

  body('aiScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('El aiScore debe estar entre 0 y 1'),

  checkValidators,
];


// Obtener moderación por ID

export const validateGetModerationById = [
  validateJWT,
  requireRole('ADMIN_ROLE'),
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ObjectId válido'),

  checkValidators
]


// Aprobar archivo

export const validateApproveModeration = [
  validateJWT,
  requireRole('ADMIN_ROLE'),
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ObjectId válido'),

  checkValidators
]


// Rechazar archivo

export const validateRejectModeration = [
  validateJWT,
  requireRole('ADMIN_ROLE'),
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ObjectId válido'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La razón del rechazo es requerida')
    .isLength({ max: 500 })
    .withMessage('La razón no puede exceder 500 caracteres'),

  checkValidators
]


// Obtener moderaciones con filtros

export const validateGetModerations = [

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El límite debe ser mayor a 0'),

  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Estado inválido'),

  checkValidators
]