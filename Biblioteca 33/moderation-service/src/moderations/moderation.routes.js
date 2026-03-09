import { Router } from 'express'

import {
  create,
  getModerations,
  getModerationById,
  approve,
  reject
} from './moderation.controller.js'

import {
  validateCreateModeration,
  validateGetModerationById,
  validateApproveModeration,
  validateRejectModeration,
  validateGetModerations
} from '../../middlewares/moderation-validator.js'

const router = Router()

router.get('/', validateGetModerations, getModerations)

router.get(
  '/:id',
  validateGetModerationById,
  getModerationById
)


router.post(
  '/',
  validateCreateModeration,
  create
)


router.patch(
  '/:id/approve',
  validateApproveModeration,
  approve
)

router.patch(
  '/:id/reject',
  validateRejectModeration,
  reject
)

export default router