import { body, param, query } from 'express-validator';
import { validateJWT, requireRole } from '../../shared/middlewares/jwt.middleware.js';
import { checkValidators } from './check-validators.js';

const TEMPLATES = ['welcome', 'verify-email', 'reset-password', 'generic'];

/**
 * Enviar email genérico (puede ser llamado por Auth u otros servicios con/sin JWT)
 */
export const validateSendEmail = [
  body('to')
    .trim()
    .notEmpty()
    .withMessage('El destinatario (to) es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('El asunto es requerido')
    .isLength({ max: 200 })
    .withMessage('El asunto no puede exceder 200 caracteres'),

  body('html')
    .optional()
    .isString()
    .withMessage('El cuerpo HTML debe ser texto'),

  body('text')
    .optional()
    .isString()
    .withMessage('El cuerpo en texto plano debe ser texto'),

  checkValidators,
];

/**
 * Enviar email por plantilla (welcome, verify-email, reset-password)
 */
export const validateSendTemplate = [
  body('to')
    .trim()
    .notEmpty()
    .withMessage('El destinatario (to) es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido'),

  body('template')
    .trim()
    .notEmpty()
    .withMessage('La plantilla es requerida')
    .isIn(TEMPLATES)
    .withMessage(`La plantilla debe ser una de: ${TEMPLATES.join(', ')}`),

  body('data')
    .optional()
    .isObject()
    .withMessage('data debe ser un objeto'),

  body('data.username')
    .optional()
    .isString(),

  body('data.token')
    .optional()
    .isString(),

  checkValidators,
];

/**
 * Listar notificaciones del usuario (requiere JWT)
 */
export const validateGetNotifications = [
  validateJWT,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe estar entre 1 y 50'),

  query('type')
    .optional()
    .isIn(['email', 'in_app'])
    .withMessage('type debe ser email o in_app'),

  checkValidators,
];

/**
 * Obtener una notificación por ID (requiere JWT)
 */
export const validateGetNotificationById = [
  validateJWT,
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ObjectId válido'),

  checkValidators,
];

/**
 * Marcar como leída (requiere JWT, solo el dueño o admin)
 */
export const validateMarkAsRead = [
  validateJWT,
  param('id')
    .isMongoId()
    .withMessage('El ID debe ser un ObjectId válido'),

  checkValidators,
];

/**
 * Notificación interna de cambio de estado de archivo
 * (la llaman ai-service y moderation-service vía x-internal-key, no usuarios finales)
 */
export const validateInternalFileStatus = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('El userId es requerido'),

  body('fileId')
    .trim()
    .notEmpty()
    .withMessage('El fileId es requerido'),

  body('status')
    .notEmpty()
    .withMessage('El status es requerido')
    .isIn(['approved', 'rejected'])
    .withMessage('El status debe ser approved o rejected'),

  body('reason')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('La razón debe ser texto')
    .isLength({ max: 1000 })
    .withMessage('La razón no puede exceder 1000 caracteres'),

  checkValidators,
];
