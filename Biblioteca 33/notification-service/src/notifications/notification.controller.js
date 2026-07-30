'use strict';

import {
  sendEmail,
  sendTemplateEmail,
  createInAppNotification,
  getNotificationsByUser,
  getNotificationById,
  markAsRead,
} from './notification.service.js';

const ADMIN_ROLE = 'ADMIN_ROLE';

// POST /send → email genérico (lo puede llamar auth-service u otros servicios, sin JWT)
export const send = async (req, res, next) => {
  try {
    const { to, subject, html, text } = req.body;

    const result = await sendEmail(to, subject, html, text);

    res.status(200).json({
      success: true,
      message: 'Email procesado',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /send-template → email por plantilla (sin JWT)
export const sendTemplate = async (req, res, next) => {
  try {
    const { to, template, data } = req.body;

    const result = await sendTemplateEmail(to, template, data || {});

    res.status(200).json({
      success: true,
      message: 'Email de plantilla procesado',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// GET / → notificaciones del usuario autenticado (userId del JWT, nunca del query)
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, type } = req.query;

    const result = await getNotificationsByUser(userId, { page, limit, type });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /:id → notificación por ID (solo dueño o ADMIN_ROLE)
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await getNotificationById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    const isOwner = notification.userId === req.user.id;
    const isAdmin = req.user.role === ADMIN_ROLE;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta notificación',
        error: 'FORBIDDEN',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /:id/read → marcar como leída
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await markAsRead(id, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// POST /internal/file-status → endpoint interno entre microservicios (x-internal-key).
// Lo llaman ai-service y moderation-service cuando cambia el estado de un archivo.
export const handleFileStatusNotification = async (req, res, next) => {
  try {
    const { userId, fileId, status, reason } = req.body;

    let category;
    let title;
    let message;

    if (status === 'approved') {
      category = 'file_approved';
      title = 'Tu archivo fue aprobado';
      message = 'Tu archivo fue aprobado y ya está disponible en la biblioteca.';
    } else if (status === 'rejected') {
      category = 'file_rejected';
      title = 'Tu archivo fue rechazado';
      message = reason
        ? `Tu archivo fue rechazado: ${reason}`
        : 'Tu archivo fue rechazado.';
    } else {
      return res.status(400).json({
        success: false,
        message: 'status debe ser "approved" o "rejected"',
        error: 'INVALID_STATUS',
      });
    }

    const notification = await createInAppNotification({
      userId,
      category,
      title,
      message,
      relatedFileId: fileId,
    });

    res.status(201).json({
      success: true,
      message: 'Notificación creada',
      notification,
    });
  } catch (error) {
    next(error);
  }
};
