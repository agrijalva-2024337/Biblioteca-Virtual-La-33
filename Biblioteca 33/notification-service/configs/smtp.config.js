'use strict';

import nodemailer from 'nodemailer';

const isEnabled = () => process.env.SMTP_ENABLED !== 'false';

const getTransporter = () => {
  if (!isEnabled()) return null;

  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

export const smtpConfig = {
  isEnabled,
  getTransporter,
  from: () => ({
    address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    name: process.env.SMTP_FROM_NAME || 'Biblioteca-Virtual-33',
  }),
  frontendUrl: () => process.env.FRONTEND_URL || 'http://localhost:5173',
};
