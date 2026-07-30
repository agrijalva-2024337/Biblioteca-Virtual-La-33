'use strict';

/**
 * Manejador global de errores compartido por los microservicios Node.
 * Reutiliza la lógica más completa (originalmente en moderation-service).
 * El nombre del servicio se toma de process.env.SERVICE_NAME para los logs.
 *
 * Nota: Express identifica los manejadores de error por su aridad (4 args),
 * por eso se incluye `next` aunque no se use.
 */
export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const serviceName = process.env.SERVICE_NAME || 'Server';
  const message =
    err?.message ||
    err?.error?.message ||
    (typeof err?.error === 'string' ? err.error : null) ||
    'Error interno del servidor';

  console.error(`Error in ${serviceName}: ${message}`);
  console.error(`Stack trace: ${err?.stack || '(sin stack)'}`);
  console.error(`Request: ${req.method} ${req.path}`);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors,
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} ya existe`,
      error: 'DUPLICATE_FIELD',
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Formato de ID inválido',
      error: 'INVALID_ID',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: 'TOKEN_EXPIRED',
    });
  }

  // Error personalizado con status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message,
      error: err.code || 'CUSTOM_ERROR',
    });
  }

  // Error por defecto del servidor
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: message,
      stack: err?.stack,
    }),
  });
};
