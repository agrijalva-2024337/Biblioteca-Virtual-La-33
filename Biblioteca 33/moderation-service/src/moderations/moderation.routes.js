import { Router } from 'express'

import {
  create,
  getModerations,
  getModerationById,
  approve,
  reject
} from './moderation.controller.js'

import {
  validateCreateModeration,
  validateGetModerationById,
  validateApproveModeration,
  validateRejectModeration,
  validateGetModerations
} from '../../middlewares/moderation-validator.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Moderation
 */

/**
 * @swagger
 * /api/v1/moderation:
 *   get:
 *     summary: Obtener moderaciones
 *     tags: [Moderation]
 */
router.get('/', validateGetModerations, getModerations)

/**
 * @swagger
 * /api/v1/moderation/{id}:
 *   get:
 *     summary: Obtener moderación por ID
 *     tags: [Moderation]
 */
router.get(
  '/:id',
  validateGetModerationById,
  getModerationById
)


/**
 * @swagger
 * /api/v1/moderation:
 *   post:
 *     summary: Crear moderación
 *     tags: [Moderation]
 */
router.post(
  '/',
  validateCreateModeration,
  create
)

/**
 * @swagger
 * /api/v1/moderation/{id}/approve:
 *   patch:
 *     summary: Aprobar contenido
 *     tags: [Moderation]
 */
router.patch(
  '/:id/approve',
  validateApproveModeration,
  approve
)

/**
 * @swagger
 * /api/v1/moderation/{id}/reject:
 *   patch:
 *     summary: Rechazar contenido
 *     tags: [Moderation]
 */
router.patch(
  '/:id/reject',
  validateRejectModeration,
  reject
)

export default router