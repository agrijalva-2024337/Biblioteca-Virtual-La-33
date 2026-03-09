'use strict'

import Moderation from './moderation.model.js'


// Crear moderación (IA envía el archivo)

export const createModeration = async (data) => {

  const moderation = new Moderation({
    fileId: data.fileId,
    uploadedBy: data.uploadedBy,
    fileURL: data.fileURL,
    aiScore: data.aiScore
  })

  return await moderation.save()
}


// Obtener moderaciones paginadas

export const fetchModerations = async ({
  page = 1,
  limit = 10,
  status = 'PENDING'
}) => {

  const filter = { status }

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

  return await moderation.save()
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

  return await moderation.save()
}