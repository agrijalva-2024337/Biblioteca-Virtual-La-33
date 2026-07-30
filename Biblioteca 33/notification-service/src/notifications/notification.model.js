'use strict';

import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'El userId es requerido'],
      index: true,
    },
    type: {
      type: String,
      enum: ['email', 'in_app'],
      required: [true, 'El type es requerido'],
    },
    category: {
      type: String,
      enum: [
        'file_approved',
        'file_rejected',
        'new_comment',
        'welcome',
        'verify_email',
        'reset_password',
        'generic',
      ],
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
    },
    message: {
      type: String,
      required: [true, 'El mensaje es requerido'],
    },
    relatedFileId: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model('Notification', notificationSchema);
