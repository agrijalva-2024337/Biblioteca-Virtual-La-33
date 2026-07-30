'use strict'

import axios from 'axios'
import {
  createModeration,
  fetchModerations,
  fetchModerationById,
  approveModeration,
  rejectModeration
} from './moderation.service.js'

const FILES_SERVICE_URL =
  process.env.FILES_SERVICE_URL || 'http://localhost:3003'

/**
 * Para TEACHER_ROLE: obtiene IDs de materias asignadas desde files-service.
 * Devuelve [] si no hay materias o si falla la consulta.
 */
const getTeacherSubjectIds = async (teacherId, authHeader) => {
  try {
    const { data } = await axios.get(`${FILES_SERVICE_URL}/subjects`, {
      params: { teacherId },
      headers: authHeader ? { Authorization: authHeader } : {},
      timeout: 10000,
    })
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    return list.map((s) => String(s._id)).filter(Boolean)
  } catch (err) {
    console.error('[moderations] no se pudieron cargar materias del docente:', err.message)
    return []
  }
}

const assertTeacherCanAccess = (moderation, allowedSubjectIds) => {
  if (!moderation?.subjectId) return false
  return allowedSubjectIds.includes(String(moderation.subjectId))
}

// Crear moderación (lo llama el servicio de IA)

export const create = async (req, res, next) => {
  try {

    const data = req.body

    const moderation = await createModeration(data)

    res.status(201).json({
      success: true,
      message: 'Archivo enviado a moderación',
      moderation
    })

  } catch (error) {
    next(error)
  }
}


// Obtener moderaciones (paginadas)

export const getModerations = async (req, res, next) => {
  try {
    const query = { ...req.query }
    const role = req.user?.role

    if (role === 'TEACHER_ROLE') {
      const authHeader = req.header('Authorization')
      const subjectIds = await getTeacherSubjectIds(req.user.id, authHeader)
      if (subjectIds.length === 0) {
        return res.status(200).json({
          success: true,
          moderations: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            limit: Number(query.limit) || 10,
          },
        })
      }
      query.subjectIds = subjectIds
    }

    const result = await fetchModerations(query)

    res.status(200).json({
      success: true,
      ...result
    })

  } catch (error) {
    next(error)
  }
}


// Obtener una moderación por ID

export const getModerationById = async (req, res, next) => {
  try {

    const { id } = req.params

    const moderation = await fetchModerationById(id)

    if (!moderation) {
      return res.status(404).json({
        success: false,
        message: 'Moderación no encontrada'
      })
    }

    if (req.user?.role === 'TEACHER_ROLE') {
      const authHeader = req.header('Authorization')
      const subjectIds = await getTeacherSubjectIds(req.user.id, authHeader)
      if (!assertTeacherCanAccess(moderation, subjectIds)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver esta moderación',
          error: 'FORBIDDEN',
        })
      }
    }

    res.status(200).json({
      success: true,
      moderation
    })

  } catch (error) {
    next(error)
  }
}


// Aprobar archivo

export const approve = async (req, res, next) => {
  try {

    const { id } = req.params
    const moderatorId = req.user?.id || "admin-test"

    if (req.user?.role === 'TEACHER_ROLE') {
      const moderation = await fetchModerationById(id)
      if (!moderation) {
        return res.status(404).json({ success: false, message: 'Moderación no encontrada' })
      }
      const authHeader = req.header('Authorization')
      const subjectIds = await getTeacherSubjectIds(req.user.id, authHeader)
      if (!assertTeacherCanAccess(moderation, subjectIds)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para moderar esta materia',
          error: 'FORBIDDEN',
        })
      }
    }

    const moderation = await approveModeration(id, moderatorId)

    res.status(200).json({
      success: true,
      message: 'Archivo aprobado',
      moderation
    })

  } catch (error) {
    next(error)
  }
}


// Rechazar archivo

export const reject = async (req, res, next) => {
  try {

    const { id } = req.params
    const { reason } = req.body
    const moderatorId = req.user?.id || "admin-test"

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'La razón del rechazo es requerida'
      })
    }

    if (req.user?.role === 'TEACHER_ROLE') {
      const moderation = await fetchModerationById(id)
      if (!moderation) {
        return res.status(404).json({ success: false, message: 'Moderación no encontrada' })
      }
      const authHeader = req.header('Authorization')
      const subjectIds = await getTeacherSubjectIds(req.user.id, authHeader)
      if (!assertTeacherCanAccess(moderation, subjectIds)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para moderar esta materia',
          error: 'FORBIDDEN',
        })
      }
    }

    const moderation = await rejectModeration(id, moderatorId, reason)

    res.status(200).json({
      success: true,
      message: 'Archivo rechazado',
      moderation
    })

  } catch (error) {
    next(error)
  }
}
