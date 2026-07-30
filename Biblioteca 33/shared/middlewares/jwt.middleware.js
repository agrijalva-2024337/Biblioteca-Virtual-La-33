'use strict';

import jwt from 'jsonwebtoken';

/**
 * Middleware compartido para validar el JWT emitido por auth-service (.NET).
 * Lee el secreto/issuer/audience desde variables de entorno del servicio que lo usa.
 */
export const validateJWT = (req, res, next) => {
  const jwtConfig = {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  };

  if (!jwtConfig.secret) {
    console.error('Error de validación JWT: JWT_SECRET no está definido');
    return res.status(500).json({
      success: false,
      message: 'Configuración del servidor inválida: falta JWT_SECRET',
    });
  }

  const token =
    req.header('x-token') ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token',
      error: 'MISSING_TOKEN',
    });
  }

  try {
    const verifyOptions = {};
    if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
    if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

    const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

    if (!decoded.role) {
      console.warn(
        `Token sin campo 'role' para usuario ${decoded.sub}. Payload:`,
        JSON.stringify(decoded, null, 2)
      );
    }

    req.user = {
      id: decoded.sub, // userId del servicio de autenticación
      jti: decoded.jti, // ID único del token
      iat: decoded.iat, // Emitido en
      role: decoded.role || 'USER_ROLE', // Rol del usuario (default: USER_ROLE)
    };

    next();
  } catch (error) {
    console.error('Error de validación JWT:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado',
        error: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al validar el token',
      error: 'TOKEN_VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware compartido para exigir uno o varios roles.
 * Debe ejecutarse después de validateJWT.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHORIZED',
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        error: 'FORBIDDEN',
        requiredRole: allowedRoles,
        yourRole: userRole,
      });
    }

    next();
  };
};
