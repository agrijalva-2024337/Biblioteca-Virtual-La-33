/**
 * Normaliza errores de axios para mostrar mensajes útiles en el panel admin.
 */
export const parseApiError = (err, fallback = 'Error de servidor') => {
  const status = err?.response?.status;
  const serverMessage =
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.response?.data?.error;

  if (
    typeof serverMessage === 'string' &&
    (serverMessage.includes('JWT_SECRET') ||
      serverMessage.includes('INTERNAL_SERVICE_KEY') ||
      serverMessage.includes('Configuración del servidor inválida'))
  ) {
    return 'Un microservicio no está configurado. Reinicia notification, moderation y files-service.';
  }

  if (status === 401) {
    return 'Tu sesión expiró o el token no es válido. Vuelve a iniciar sesión.';
  }

  if (status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage;
  }

  return fallback;
};
