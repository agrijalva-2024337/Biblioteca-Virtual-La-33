'use strict'

import {
  createModeration,
  fetchModerations,
  fetchModerationById,
  approveModeration,
  rejectModeration
} from './moderation.service.js'


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

    const result = await fetchModerations(req.query)

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