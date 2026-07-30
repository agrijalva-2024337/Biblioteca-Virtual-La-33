'use strict'

import axios from 'axios'
import Moderation from './moderation.model.js'


const FILES_SERVICE_URL =
  process.env.FILES_SERVICE_URL || 'http://localhost:3003'

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL ||
  'http://localhost:3005/Biblioteca/v1/notifications/internal/file-status'

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY


// Sincroniza el estado del File en files-service tras moderar (no bloqueante).
// Si falla, el cambio en Moderation YA se guardó → File y Moderation quedan
// desincronizados y hay que revisarlo manualmente, por eso se loggea fuerte.
const syncFileStatus = async (fileId, status, reason) => {
  try {
    await axios.patch(
      `${FILES_SERVICE_URL}/files/${fileId}/status`,
      { status, ...(reason ? { reason } : {}) },
      {
        headers: { 'x-internal-key': INTERNAL_SERVICE_KEY },
        timeout: 15000
      }
    )
  } catch (err) {
    console.error(
      `[DESINCRONIZACIÓN] No se pudo actualizar el File ${fileId} en files-service ` +
        `tras moderar (status=${status}). La Moderation ya quedó guardada; ` +
        `revisar manualmente. Detalle:`,
      err.message
    )
  }
}

// Notifica al estudiante el resultado de la moderación (no bloqueante)
const notifyStudent = async ({ userId, fileId, status, reason }) => {
  try {
    // TODO: este endpoint se implementa en notification-service en el prompt 4
    await axios.post(
      NOTIFICATION_SERVICE_URL,
      { userId, fileId, status, ...(reason ? { reason } : {}) },
      {
        headers: { 'x-internal-key': INTERNAL_SERVICE_KEY },
        timeout: 15000
      }
    )
  } catch (err) {
    console.error(
      `Error notificando al estudiante (fileId ${fileId}) en notification-service:`,
      err.message
    )
  }
}


// Crear moderación (IA envía el archivo)

export const createModeration = async (data) => {

  const moderation = new Moderation({
    fileId: data.fileId,
    uploadedBy: data.uploadedBy,
    subjectId: data.subjectId ? String(data.subjectId) : undefined,
    fileURL: data.fileURL,
    title: data.title,
    originalName: data.originalName,
    sizeBytes: data.sizeBytes,
    aiScore: data.aiScore,
    aiClassification: data.aiClassification,
    aiReason: data.aiReason,
  })

  return await moderation.save()
}


// Obtener moderaciones paginadas

export const fetchModerations = async ({
  page = 1,
  limit = 10,
  status = 'PENDING',
  subjectIds,
}) => {

  const filter = { status }

  if (Array.isArray(subjectIds) && subjectIds.length > 0) {
    filter.subjectId = { $in: subjectIds.map(String) }
  }

  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)

  const moderations = await Moderation.find(filter)
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)
    .sort({ createdAt: -1 })

  const total = await Moderation.countDocuments(filter)

  return {
    moderations,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalRecords: total,
      limit: limitNumber
    }
  }
}


// Obtener moderación por ID

export const fetchModerationById = async (id) => {
  return Moderation.findById(id)
}


// Aprobar archivo

export const approveModeration = async (id, moderatorId) => {

  const moderation = await Moderation.findById(id)

  if (!moderation) {
    throw new Error('Moderation not found')
  }

  moderation.status = 'APPROVED'
  moderation.reviewedBy = moderatorId
  moderation.reviewedAt = new Date()

  const saved = await moderation.save()

  // Avisar a files-service y al estudiante (no bloqueante)
  await syncFileStatus(moderation.fileId, 'approved')
  await notifyStudent({
    userId: moderation.uploadedBy,
    fileId: moderation.fileId,
    status: 'approved'
  })

  return saved
}


// Rechazar archivo

export const rejectModeration = async (id, moderatorId, reason) => {

  const moderation = await Moderation.findById(id)

  if (!moderation) {
    throw new Error('Moderation not found')
  }

  moderation.status = 'REJECTED'
  moderation.reason = reason
  moderation.reviewedBy = moderatorId
  moderation.reviewedAt = new Date()

  const saved = await moderation.save()

  // Avisar a files-service y al estudiante (no bloqueante)
  await syncFileStatus(moderation.fileId, 'rejected', reason)
  await notifyStudent({
    userId: moderation.uploadedBy,
    fileId: moderation.fileId,
    status: 'rejected',
    reason
  })

  return saved
}