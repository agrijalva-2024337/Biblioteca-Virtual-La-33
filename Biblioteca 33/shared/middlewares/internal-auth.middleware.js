'use strict';

/**
 * Valida la API key compartida entre microservicios (header x-internal-key)
 * contra la variable de entorno INTERNAL_SERVICE_KEY.
 *
 * Protege endpoints internos que solo deben ser llamados por otros servicios
 * (ai-service, moderation-service, etc.), nunca por usuarios finales con su JWT.
 */
export const validateInternalKey = (req, res, next) => {
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;

  if (!expectedKey) {
    console.error(
      'Error de autenticación interna: INTERNAL_SERVICE_KEY no está definido'
    );
    return res.status(500).json({
      success: false,
      message: 'Configuración del servidor inválida: falta INTERNAL_SERVICE_KEY',
    });
  }

  const providedKey = req.header('x-internal-key');

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Clave de servicio interna inválida o ausente',
      error: 'INVALID_INTERNAL_KEY',
    });
  }

  next();
};
