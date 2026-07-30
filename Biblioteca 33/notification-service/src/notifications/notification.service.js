'use strict';

import { smtpConfig } from '../../configs/smtp.config.js';
import Notification from './notification.model.js';

const ADMIN_ROLE = 'ADMIN_ROLE';

/**
 * Envía un email genérico vía SMTP (nodemailer).
 * Si SMTP está deshabilitado (SMTP_ENABLED=false) no falla: loggea y retorna.
 */
export const sendEmail = async (to, subject, html, text) => {
  if (!smtpConfig.isEnabled()) {
    console.log(
      `[notification-service] Envío de emails deshabilitado (SMTP_ENABLED=false). Email a "${to}" omitido.`
    );
    return { sent: false, disabled: true };
  }

  const transporter = smtpConfig.getTransporter();

  const info = await transporter.sendMail({
    from: smtpConfig.from(),
    to,
    subject,
    html,
    text,
  });

  return { sent: true, messageId: info.messageId };
};

/**
 * Mapea el nombre de plantilla (con guiones) a la category del modelo (con guion bajo).
 */
const templateToCategory = {
  welcome: 'welcome',
  'verify-email': 'verify_email',
  'reset-password': 'reset_password',
  generic: 'generic',
};

/**
 * Construye asunto + HTML de cada plantilla soportada.
 * Plantillas: welcome, verify-email, reset-password, generic.
 */
const buildTemplate = (template, data = {}) => {
  const frontendUrl = smtpConfig.frontendUrl();
  const username = data.username || 'usuario';
  const token = data.token || '';

  switch (template) {
    case 'welcome': {
      return {
        subject: '¡Bienvenido a Biblioteca-Virtual-33!',
        html: `
          <h2>¡Bienvenido a Biblioteca-Virtual-33, ${username}!</h2>
          <p>Tu cuenta ha sido verificada y activada exitosamente.</p>
          <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
          <p>¡Gracias por unirte a nosotros!</p>
        `,
      };
    }

    case 'verify-email': {
      const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
      return {
        subject: 'Verifica tu dirección de correo electrónico',
        html: `
          <h2>¡Bienvenido ${username}!</h2>
          <p>Por favor, verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
          <p><a href="${verificationUrl}">Verificar correo electrónico</a></p>
          <p>Si no puedes hacer clic, copia y pega esta URL en tu navegador:</p>
          <p>${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
        `,
      };
    }

    case 'reset-password': {
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
      return {
        subject: 'Restablece tu contraseña',
        html: `
          <h2>Solicitud de restablecimiento de contraseña</h2>
          <p>Hola ${username},</p>
          <p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <p><a href="${resetUrl}">Restablecer contraseña</a></p>
          <p>Si no puedes hacer clic, copia y pega esta URL en tu navegador:</p>
          <p>${resetUrl}</p>
          <p>Este enlace expirará en 1 hora. Si no solicitaste esto, ignora este correo.</p>
        `,
      };
    }

    case 'generic':
    default: {
      return {
        subject: data.subject || 'Notificación de Biblioteca-Virtual-33',
        html: data.html || `<p>${data.message || ''}</p>`,
      };
    }
  }
};

/**
 * Envía un email basado en plantilla y guarda un registro Notification (type: "email").
 */
export const sendTemplateEmail = async (to, template, data = {}) => {
  const { subject, html } = buildTemplate(template, data);

  const result = await sendEmail(to, subject, html);

  await Notification.create({
    // Para emails no siempre hay un userId de la app; usamos el destinatario como referencia.
    userId: data.userId || to,
    type: 'email',
    category: templateToCategory[template] || 'generic',
    title: subject,
    message: data.message || subject,
  });

  return result;
};

/**
 * Crea una notificación in-app persistida en MongoDB.
 */
export const createInAppNotification = async ({
  userId,
  category,
  title,
  message,
  relatedFileId,
}) => {
  return Notification.create({
    userId,
    type: 'in_app',
    category,
    title,
    message,
    relatedFileId,
  });
};

/**
 * Lista paginada de notificaciones de un usuario.
 * Mismo patrón que moderation-service/src/moderations/moderation.service.js (fetchModerations).
 */
export const getNotificationsByUser = async (
  userId,
  { page = 1, limit = 10, type } = {}
) => {
  const filter = { userId };

  if (type) {
    filter.type = type;
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const notifications = await Notification.find(filter)
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(filter);

  return {
    notifications,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber,
    },
  };
};

/**
 * Obtiene una notificación por ID.
 */
export const getNotificationById = async (id) => {
  return Notification.findById(id);
};

/**
 * Marca una notificación como leída, solo si pertenece al usuario o si es ADMIN_ROLE.
 */
export const markAsRead = async (id, userId, role) => {
  const notification = await Notification.findById(id);

  if (!notification) {
    const error = new Error('Notificación no encontrada');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const isOwner = notification.userId === userId;
  const isAdmin = role === ADMIN_ROLE;

  if (!isOwner && !isAdmin) {
    const error = new Error('No tienes permiso para modificar esta notificación');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  notification.read = true;
  notification.readAt = new Date();

  return await notification.save();
};
