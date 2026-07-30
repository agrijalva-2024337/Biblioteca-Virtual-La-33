'use strict';

import { Router } from 'express';

import {
  send,
  sendTemplate,
  getMyNotifications,
  getById,
  markNotificationAsRead,
  handleFileStatusNotification,
} from './notification.controller.js';

import {
  validateSendEmail,
  validateSendTemplate,
  validateGetNotifications,
  validateGetNotificationById,
  validateMarkAsRead,
  validateInternalFileStatus,
} from '../../middlewares/notification-validator.js';

import { validateInternalKey } from '../../../shared/middlewares/internal-auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 */

/**
 * @swagger
 * /Biblioteca/v1/notifications/send:
 *   post:
 *     summary: Enviar email genérico (uso entre servicios, requiere x-internal-key)
 *     tags: [Notifications]
 */
router.post('/send', validateInternalKey, validateSendEmail, send);

/**
 * @swagger
 * /Biblioteca/v1/notifications/send-template:
 *   post:
 *     summary: Enviar email por plantilla (uso entre servicios, requiere x-internal-key)
 *     tags: [Notifications]
 */
router.post('/send-template', validateInternalKey, validateSendTemplate, sendTemplate);

/**
 * @swagger
 * /Biblioteca/v1/notifications:
 *   get:
 *     summary: Listar notificaciones del usuario autenticado
 *     tags: [Notifications]
 */
router.get('/', validateGetNotifications, getMyNotifications);

/**
 * @swagger
 * /Biblioteca/v1/notifications/{id}:
 *   get:
 *     summary: Obtener una notificación por ID (dueño o ADMIN_ROLE)
 *     tags: [Notifications]
 */
router.get('/:id', validateGetNotificationById, getById);

/**
 * @swagger
 * /Biblioteca/v1/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 */
router.patch('/:id/read', validateMarkAsRead, markNotificationAsRead);

/**
 * @swagger
 * /Biblioteca/v1/notifications/internal/file-status:
 *   post:
 *     summary: Crear notificación in-app de cambio de estado de archivo (endpoint interno, x-internal-key)
 *     description: Lo llaman ai-service y moderation-service. No es para usuarios finales.
 *     tags: [Notifications]
 */
router.post(
  '/internal/file-status',
  validateInternalKey,
  validateInternalFileStatus,
  handleFileStatusNotification
);

export default router;
