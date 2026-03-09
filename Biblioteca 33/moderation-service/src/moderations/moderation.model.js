'use strict';

import { Schema, model } from 'mongoose';

const moderationSchema = new Schema(
  {
    fileId: {
      type: String,
      required: [true, 'El ID del archivo es requerido'],
      trim: true,
      maxLength: [100, 'El ID no puede exceder 100 caracteres'],
    },
    uploadedBy: {
      type: String,
      required: [true, 'El ID del usuario que sube el archivo es requerido'],
    },
    fileURL: {
      type: String,
      required: [true, 'La URL del archivo es requerida'],
      trim: true,
    },
    aiScore: {
    type: Number,
    min: 0,
    max: 1
    },
    status: {
      type: String,
      enum : ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reason: {
        type: String,
        trim: true,
    },
    reviewedBy: {
        type: String
    },
    reviewedAt: {
        type: Date
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);  

export default model('Moderation', moderationSchema);
