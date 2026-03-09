/**
 * Manejador global de errores para IA-OCR-Service.
 * Sigue la misma estructura que Moderacion-Service.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`Error in IA-OCR Service: ${err.message}`);
  console.error(`Stack trace: ${err.stack}`);
  console.error(`Request: ${req.method} ${req.path}`);

  // Error personalizado con status
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.code || 'CUSTOM_ERROR',
    });
  }

  // Error por defecto del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
};
